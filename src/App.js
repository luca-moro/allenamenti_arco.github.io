import { useMemo, useState, useEffect } from "react";
import { Calendar, X, Pause, Plus, Minus } from "lucide-react";
import { initializeApp } from 'firebase/app';
import { getFirestore, updateDoc } from 'firebase/firestore';
import { collection, doc, getDocs, setDoc, addDoc, getDoc } from "firebase/firestore";
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import React from "react";
import "./App.css";
import logo from "./logo192.png"; // Import the logo image
import arcoImage from "./arco.jpg"
import Modal from "./Modal"

const firebaseConfig = {
  apiKey: "AIzaSyARiqtsVR7cmX6iU3cD0P7LvvWfp4zv4To",
  authDomain: "prenotazione-arco.firebaseapp.com",
  projectId: "prenotazione-arco",
  storageBucket: "prenotazione-arco.firebasestorage.app",
  messagingSenderId: "308635909661",
  appId: "1:308635909661:web:ea5396b2903d880f30d0f4",
  databaseURL: "https://prenotazione-arco-default-rtdb.europe-west1.firebasedatabase.app" // Updated URL
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

async function get_initial_data() {
  const docRef = doc(db, 'giorni', '5h6XEaykZl2USUmmcb6U');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return (JSON.parse(docSnap.data().campo));
  } else {
    console.log("No such document!");
  }
};

const initialData = get_initial_data();


async function fetchGiorniDocument() {
  // Define a reference to the document
  const docRef = doc(db, 'giorni', '5h6XEaykZl2USUmmcb6U');

  // Fetch the document
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      return JSON.parse(docSnap.data().campo); // Document data
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
};

async function updatePopup(newMessage, newEnabled) {
  // Reference the specific document you want to update
  const docRef = doc(db, 'giorni', 'popup_avvisi');
  const updateData = {
    enabled: newEnabled,
    message: newMessage,
  };

  try {
    // Update the document with the new data
    await updateDoc(docRef, updateData);
    console.log("Document successfully updated!");
  } catch (error) {
    console.error("Error updating document: ", error);
  }
};

async function updateGiorniDocument(newData) {
  // Reference the specific document you want to update
  const docRef = doc(db, 'giorni', '5h6XEaykZl2USUmmcb6U');
  const updateData = {
    campo: JSON.stringify(newData),
  };

  try {
    // Update the document with the new data
    await updateDoc(docRef, updateData);
    console.log("Document successfully updated!");
  } catch (error) {
    console.error("Error updating document: ", error);
  }
};

interface Prenotazione {
  nome: string;
  giorno: string;
  turno: string;
}

interface Giorno {
  nome: string;
  turni: {
    nome: string;
    posti: number;
    prenotazioni: Prenotazione[];
    sospeso: boolean;
  }[];
}

//const adminpassword = "LUCA"; // Define the correct password here
async function fetchPassword(docId) {
  const docRef = doc(db, 'giorni', docId);

  // Fetch the document
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().password; // Document data
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");

//  const correctPassword = "luca"; // Set your desired password

  const handleLogin = async (e) => {
    e.preventDefault();
    // Fetch the stored password from Firestore
    const loginPassword = await fetchPassword("loginpassword");
    const adminpassword = await fetchPassword("adminpassword");
    if (password === loginPassword) {
      setIsLoggedIn(true);
    } else if (password === adminpassword) {
      setIsAdmin(true)
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('Lunedì');
  const [formInput, setFormInput] = useState({turno: "Turno Unico", nome: "" });
  const [formAllenatoreInput, setFormAllenatoreInput] = useState("");
  const [formLuogoInput, setFormLuogoInput] = useState("");
  const [weekDates, setWeekDates] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" }); // Sorting state
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showModal, setShowModal] = useState(false); // To track whether to show the modal

  // Update the default value of `formInput.turno` based on `activeTab`
  useEffect(() => {
    if (activeTab === "Giovedì") {
      setFormInput((prev) => ({ ...prev, turno: "Turno Unico" }));
    } else {
      setFormInput((prev) => ({ ...prev, turno: "Turno Unico" }));
    }
  }, [activeTab]); // Runs whenever `activeTab` changes

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'giorni', '5h6XEaykZl2USUmmcb6U');

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(JSON.parse(docSnap.data().campo));
        } else {
          console.log("No such document!");
        }

    };

    fetchData();
  }, []);

  useEffect(() => {
    const getNextDateForDay = (dayName) => {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = new Date();
      const todayIndex = today.getDay();
      const targetIndex = daysOfWeek.indexOf(dayName);
      const diff = (targetIndex - todayIndex + 7) % 7;
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + diff);
      return nextDate.toLocaleDateString("it-IT", { weekday: "short", month: "short", day: "numeric" }).substr(3);
    };
    const dates = {
      Lunedì: getNextDateForDay("Monday"),
      Mercoledì: getNextDateForDay("Wednesday"),
      Giovedì: getNextDateForDay("Thursday"),
      Sabato: getNextDateForDay("Saturday"),
    };

    setWeekDates(dates);
  }, []);

  function postiRimasti(totale, usati) {
    return totale - usati;
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Ensure name is not empty
    if (formInput.nome.trim() === "") return;

    // Extract the current turn
    const { turno, nome } = formInput;

    // Update the data state
    setData((prevData) => {
      const updatedDay = { ...prevData[activeTab] }; // Clone the active day

      updatedDay.turni = updatedDay.turni.map((turnoItem) => {
        if (turnoItem.nome === turno) {
          if (turnoItem.prenotazioni.length < turnoItem.posti && !turnoItem.sospeso) {
            return {
              ...turnoItem,
              prenotazioni: [
                ...turnoItem.prenotazioni,
                { nome: nome, turno: turno }, // Add the new booking
              ],
            };
          } else if (turnoItem.sospeso) {
            alert("Allenamento sospeso!");
          } else {
            alert("Posti esauriti!");
          }
        }
        return turnoItem; // Keep other turns unchanged
      });

      const updatedData = {
        ...prevData,
        [activeTab]: updatedDay, // Update the active day
      };

      updateGiorniDocument(updatedData);

      return updatedData;
    });

    // Reset the form input
    setFormInput({ turno: "Turno Unico", nome: "" });
  };

  // Handle form Allenatore submission
  const handleFormAllenatoreSubmit = (e) => {
    e.preventDefault();

    // Ensure name is not empty
    if (formAllenatoreInput.trim() === "") return;

    // Update the data state
    setData((prevData) => {
      const updatedDay = { ...prevData[activeTab] }; // Clone the active day

      updatedDay.turni = updatedDay.turni.map((turnoItem) => {
        return {
          ...turnoItem,
          allenatore: formAllenatoreInput,
        }; // Keep other turns unchanged
      });

      const updatedData = {
        ...prevData,
        [activeTab]: updatedDay, // Update the active day
      };

      updateGiorniDocument(updatedData);

      return updatedData;
    });

    // Reset the form input
    setFormAllenatoreInput("");
  };

  const handleFormLuogoSubmit = (e) => {
    e.preventDefault();

    // Ensure name is not empty
    if (formLuogoInput.trim() === "") return;

    // Update the data state
    setData((prevData) => {
      const updatedDay = { ...prevData[activeTab] }; // Clone the active day

      updatedDay.luogo = formLuogoInput;

      const updatedData = {
        ...prevData,
        [activeTab]: updatedDay, // Update the active day
      };

      updateGiorniDocument(updatedData);

      return updatedData;
    });

    // Reset the form input
    setFormLuogoInput("");
  };

   // Delete a record
  const handleDelete = (day, turnoName, nomeToDelete) => {
    const isConfirmed = window.confirm(
      "Sei sicuro di voler CANCELLARE la prenotazione per " + nomeToDelete + "?"
    );

    if (!isConfirmed) return;

    setData((prevData) => {
      const updatedDay = { ...prevData[day] }; // Clone the specific day
      updatedDay.turni = updatedDay.turni.map((turno) => {
        if (turno.nome === turnoName) {
          return {
            ...turno,
            prenotazioni: turno.prenotazioni.filter((prenotazione) => prenotazione.nome !== nomeToDelete),
          };
        }
        return turno;
      });

      const updatedData = {
        ...prevData,
        [day]: updatedDay, // Update only the relevant day
      };

      updateGiorniDocument(updatedData);

      return updatedData;
    });
  };

  // Suspend or resume a training turn
  const handleSuspendToggle = async (day, turnoName) => {
    const enteredPassword = window.prompt(
      "Inserisci la password per sospendere l'allenamento:"
    );

    const adminpassword = await fetchPassword("adminpassword");

    if (enteredPassword === adminpassword) {
      setData((prevData) => {
        const updatedDay = { ...prevData[day] };
        updatedDay.turni = updatedDay.turni.map((turno) => {
          if (turno.nome === turnoName) {
            return { ...turno, sospeso: !turno.sospeso }; // Toggle suspension
          }
          return turno;
        });

        const updatedData = {
          ...prevData,
          [day]: updatedDay,
        };

        updateGiorniDocument(updatedData);
        return updatedData;
      });
    } else {
      alert("Password sbagliata, impossibile procedere");
    }
  };

  const handleReserveToggle = async (day, turnoName) => {
    const enteredPassword = window.prompt(
      "Inserisci la password per riservare l'allenamento agli iscritti fitarco:"
    );

    const adminpassword = await fetchPassword("adminpassword");

    if (enteredPassword === adminpassword) {
      setData((prevData) => {
        const updatedDay = { ...prevData[day] };
        updatedDay.turni = updatedDay.turni.map((turno) => {
          if (turno.nome === turnoName) {
            return { ...turno, riservato: !turno.riservato }; // Toggle suspension
          }
          return turno;
        });

        const updatedData = {
          ...prevData,
          [day]: updatedDay,
        };

        updateGiorniDocument(updatedData);
        return updatedData;
      });
    } else {
      alert("Password sbagliata, impossibile procedere");
    }
  };

  // Update available spots for a turn
  const handleUpdatePosti = (day, turnoName, newPosti) => {
    setData((prevData) => {
      const updatedDay = { ...prevData[day] };
      updatedDay.turni = updatedDay.turni.map((turno) => {
        if (turno.nome === turnoName) {
          return { ...turno, posti: newPosti }; // Update posti
        }
        return turno;
      });

      const updatedData = {
        ...prevData,
        [day]: updatedDay,
      };

      updateGiorniDocument(updatedData);
      return updatedData;
    });

  };

  // Delete all subs for that turn
  const handleDeleteAllSubs = async (day, turnoName) => {
    const enteredPassword = window.prompt(
      "Inserisci la password per cancellare tutti gli iscritti di " + day
    );

    const adminpassword = await fetchPassword("adminpassword");

    if (enteredPassword === adminpassword) {
      setData((prevData) => {
        const updatedDay = { ...prevData[day] };
        updatedDay.turni = updatedDay.turni.map((turno) => {
          if (turno.nome === turnoName) {
            return { ...turno, prenotazioni: [] };
          }
          return turno;
        });

        const updatedData = {
          ...prevData,
          [day]: updatedDay,
        };

        updateGiorniDocument(updatedData);
        return updatedData;
      });
    } else {
      alert("Password sbagliata, impossibile procedere");
    }
  };


  // Load settings from localStorage when component mounts
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'giorni', 'popup_avvisi');

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMessage(docSnap.data().message);
        setShowPopup(docSnap.data().enabled);

        // Show popup if enabled
        if (docSnap.data().enabled && (isLoggedIn || isAdmin)) {
          setShowModal(true);
        }
      } else {
        console.log("No such document!");
      }

    };

    fetchData();
  }, [isLoggedIn, isAdmin]);


  // Save settings when inputs change
  const handleSavePopup = async (e) => {
    e.preventDefault();
    try {
      updatePopup(message, showPopup)
      alert("Settings saved successfully!");

      // Show popup immediately if enabled
      if (showPopup) {
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };



  // RETURN
  if (!isLoggedIn && !isAdmin) {
    return (
      <div className="login-page">
        <form className="login-form" onSubmit={handleLogin}>
          <img src={logo} alt="Logo" className="login-logo" />
          <h2>Login to Arcieri Valconca</h2>
          <input
            type="password"
            placeholder="Inserisci Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="primary-button">
            Login
          </button>
        </form>
      </div>
    );
  }
  else if (isAdmin) {
    return (
      <div className="App" style={{
          backgroundImage: `url(${arcoImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed", // Keeps the background fixed
          minHeight: "100vh", // Ensures it covers the whole viewport
          }}
        >
        {/* Navbar */}
        {showModal && <Modal message={message} onClose={handleCloseModal} />}
        <header className="navbar">
          <div className="navbar-left">
            <img src={logo} alt="Logo" className="navbar-logo" />
            <div className="logo-text">Arcieri Valconca</div>
          </div>
          <button className="hamburger" onClick={toggleMenu}>
            ☰
          </button>
          <nav className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
            <a href="Segnapunti_10_vole.pdf" download="Segnapunti_10_vole.pdf">Download Segnapunti Indoor</a>
            <a href="Segnapunti_12_vole_72_frecce.pdf" download="Segnapunti_12_vole_72_frecce.pdf">Download Segnapunti Outdoor</a>
            <a href="https://docs.google.com/spreadsheets/d/11_P5Tp79USRnDzy4NDw_2u3zsvyeaU33LsEISs46uKs/edit?gid=0#gid=0" target="_blank">Calendario Tecnici</a>
            <a href="https://docs.google.com/spreadsheets/d/1eO8TQW-4I0wmI7VCpdxiNsQRAAzB5lsx/edit?gid=1333899302#gid=1333899302" target="_blank">File Gare</a>
          </nav>
        </header>

        {/* Tabs Section */}
        <div className="tabbini">
          <div className="tabs">
            {Object.keys(data).map((day) => (
              <button
                key={day}
                className={`tab-button ${activeTab === day ? "active" : ""}`}
                onClick={() => setActiveTab(day)}
              >
                {day + weekDates[day]}
              </button>
            ))}
          </div>
          <div>
            <h2><font size="5">Calendario del <strong>{activeTab.toUpperCase()}</strong> a <strong>{data[activeTab].luogo.toUpperCase()}</strong></font></h2>
          </div>
        </div>

        <div className="Mecca">
          {data[activeTab].turni.map((turno) => (
            <section className="booking-section">
              <div key={turno.nome} className="turno-section">
                <h2><strong>{turno.nome}</strong></h2>
                <p>Posti disponibili: <strong>{postiRimasti(turno.posti, turno.prenotazioni.length)+"/"+turno.posti}</strong></p>
                <p>Allenatore: <strong>{turno.allenatore}</strong></p>
                <p>Stato: <strong>{turno.sospeso ? <font style={{color:"#990000"}}>Sospeso</font> : "Attivo"}</strong></p>
                {turno.riservato ? <p><strong><font style={{color:"#990000"}}>SOLO ISCRITTI FITARCO</font></strong></p> : <br />}

                <div className="turno-controls">
                  {/* Toggle Suspension */}
                  <div>
                    <button
                      className={`suspend-button ${turno.riservato ? "resume" : "suspend"}`}
                      onClick={() => handleReserveToggle(activeTab, turno.nome)}
                    >
                      {turno.riservato ? "Allenamento Libero" : "Riserva FITARCO"}
                    </button>
                    <button
                      className={`suspend-button ${turno.sospeso ? "resume" : "suspend"}`}
                      onClick={() => handleSuspendToggle(activeTab, turno.nome)}
                    >
                      {turno.sospeso ? "Riprendi Allenamento" : "Sospendi Allenamento"}
                    </button>
                  </div>

                  {/* Update Available Spots */}
                  <div className="posti-controls">
                    <div>
                      <button
                        onClick={() => handleUpdatePosti(activeTab, turno.nome, turno.posti - 1)}
                        disabled={turno.posti <= 0}
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleUpdatePosti(activeTab, turno.nome, turno.posti + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div>
                      <button className="delete-subs"
                        onClick={() => handleDeleteAllSubs(activeTab, turno.nome)}
                      >
                        Cancella Iscritti
                      </button>
                    </div>
                  </div>
                </div>

                {/* Booking Table */}
                <table className="booking-table">
                  <thead>
                    <tr>
                      <th>Nome Arciere</th>
                      <th>Cancella Prenotazione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turno.prenotazioni.map((prenotazione) => (
                      <tr key={prenotazione.nome}>
                        <td>{prenotazione.nome}</td>
                        <td>
                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(activeTab, turno.nome, prenotazione.nome)
                            }
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {turno.prenotazioni.length === 0 && (
                  <p className="no-data">Nessun iscritto per {turno.nome}.</p>
                )}
                <h2></h2>
                <h2></h2>
              </div>
            </section>
          ))}
        </div>

        {/* Form Section */}
        <section className="form-section">
          <h1>Prenota allenamento per <strong>{activeTab}</strong></h1> <br />
          <form className="booking-form">
            <select
              value={formInput.turno}
              onChange={(e) => setFormInput({ ...formInput, turno: e.target.value })}
            >
              {data[activeTab].turni.map((turno) => (
                <option key={turno.nome} value={turno.nome}>
                  {turno.nome}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Inserisci il tuo nome"
              value={formInput.nome}
              onChange={(e) => setFormInput({ ...formInput, nome: e.target.value })}
              required
            />
            <button type="submit" className="primary-button" onClick={handleFormSubmit}>
              Invia
            </button>
          </form>
        </section>

        <section className="form-section">
          <h1>Imposta Allenatore per il giorno selezionato</h1> <br />
          <form className="booking-form">
            <input
                type="text"
                placeholder="Inserisci il nome dell'allenatore"
                value={formAllenatoreInput}
                onChange={(e) => setFormAllenatoreInput(e.target.value)}
                required
              />
            <button type="submit" className="primary-button" onClick={handleFormAllenatoreSubmit}>
              Cambia Allenatore
            </button>
          </form>
        </section>

        <section className="form-section">
          <h1>Imposta Luogo per il giorno selezionato</h1> <br />
          <form className="booking-form">
            <input
                type="text"
                placeholder="Inserisci il luogo dell'allenamento"
                value={formLuogoInput}
                onChange={(e) => setFormLuogoInput(e.target.value)}
                required
              />
            <button type="submit" className="primary-button" onClick={handleFormLuogoSubmit}>
              Cambia Luogo
            </button>
          </form>
        </section>

        <section className="form-section">
          <h1>Attiva/Disattiva popup avvisi</h1> <br />
          <form className="booking-form">
            <input
                type="text"
                placeholder="Inserisci il messaggio del popup"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            <input
                  type="checkbox"
                  checked={showPopup}
                  onChange={(e) => setShowPopup(e.target.checked)}
                />
            <span>Attiva popup</span>
            <button
              onClick={handleSavePopup}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              Salva Popup
            </button>
          </form>
        </section>

        {/* Footer */}
        <footer>
          <p>Arcieri Apollo Artemide Valconca</p>
        </footer>
      </div>
    );
  }
  else {
    return (
      <div className="App" style={{
          backgroundImage: `url(${arcoImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed", // Keeps the background fixed
          minHeight: "100vh", // Ensures it covers the whole viewport
          }}
        >
        {/* Navbar */}
        {showModal && <Modal message={message} onClose={handleCloseModal} />}
        <header className="navbar">
          <div className="navbar-left">
            <img src={logo} alt="Logo" className="navbar-logo" />
            <div className="logo-text">Arcieri Valconca</div>
          </div>
          <button className="hamburger" onClick={toggleMenu}>
            ☰
          </button>
          <nav className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
            <a href="Segnapunti_10_vole.pdf" download="Segnapunti_10_vole.pdf">Download Segnapunti Indoor</a>
            <a href="Segnapunti_12_vole_72_frecce.pdf" download="Segnapunti_12_vole_72_frecce.pdf">Download Segnapunti Outdoor</a>
            <a href="https://docs.google.com/spreadsheets/d/11_P5Tp79USRnDzy4NDw_2u3zsvyeaU33LsEISs46uKs/edit?gid=0#gid=0" target="_blank">Calendario Tecnici</a>
            <a href="https://docs.google.com/spreadsheets/d/1eO8TQW-4I0wmI7VCpdxiNsQRAAzB5lsx/edit?gid=1333899302#gid=1333899302" target="_blank">File Gare</a>
          </nav>
        </header>

        {/* Tabs Section */}
        <div className="tabbini">
          <div className="tabs">
            {Object.keys(data).map((day) => (
              <button
                key={day}
                className={`tab-button ${activeTab === day ? "active" : ""}`}
                onClick={() => setActiveTab(day)}
              >
                {day + weekDates[day]}
              </button>
            ))}
          </div>
          <div>
            <h2><font size="5">Calendario del <strong>{activeTab.toUpperCase()}</strong> a <strong>{data[activeTab].luogo.toUpperCase()}</strong></font></h2>
          </div>
        </div>

        <div className="Mecca">
          {data[activeTab].turni.map((turno) => (
            <section className="booking-section">
              <div key={turno.nome} className="turno-section">
                <h2><strong>{turno.nome}</strong></h2>
                <p>Posti disponibili: <strong>{postiRimasti(turno.posti, turno.prenotazioni.length)+"/"+turno.posti}</strong></p>
                <p>Allenatore: <strong>{turno.allenatore}</strong></p>
                <p>Stato: <strong>{turno.sospeso ? <font style={{color:"#990000"}}>Sospeso</font> : "Attivo"}</strong></p>
                {turno.riservato ? <p><strong><font style={{color:"#990000"}}>SOLO ISCRITTI FITARCO</font></strong></p> : <br />}

                {/* Booking Table */}
                <table className="booking-table">
                  <thead>
                    <tr>
                      <th>Nome Arciere</th>
                      <th>Cancella Prenotazione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turno.prenotazioni.map((prenotazione) => (
                      <tr key={prenotazione.nome}>
                        <td>{prenotazione.nome}</td>
                        <td>
                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(activeTab, turno.nome, prenotazione.nome)
                            }
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {turno.prenotazioni.length === 0 && (
                  <p className="no-data">Nessun iscritto per {turno.nome}.</p>
                )}
                <h2></h2>
                <h2></h2>
              </div>
            </section>
          ))}
        </div>

        {/* Form Section */}
        <section className="form-section">
          <h1>Prenota allenamento per <strong>{activeTab}</strong></h1> <br />
          <form className="booking-form">
            <select
              value={formInput.turno}
              onChange={(e) => setFormInput({ ...formInput, turno: e.target.value })}
            >
              {data[activeTab].turni.map((turno) => (
                <option key={turno.nome} value={turno.nome}>
                  {turno.nome}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Inserisci il tuo nome"
              value={formInput.nome}
              onChange={(e) => setFormInput({ ...formInput, nome: e.target.value })}
              required
            />
            <button type="submit" className="primary-button" onClick={handleFormSubmit}>
              Invia
            </button>
          </form>
        </section>

        {/* Footer */}
        <footer>
          <p>Arcieri Apollo Artemide Valconca</p>
        </footer>
      </div>
    );
  }
}

export default App;

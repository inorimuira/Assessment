import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AssessmentFS.css";

const baseURL = "http://localhost:3001"; 

const SelfPeer = () => {
  const [currentPage, setCurrentPage] = useState("main");
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [peerList, setPeerList] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState("option1"); // Default phase
  const [batchNumber, setBatchNumber] = useState('');

  const cards = [
    { title: "SOLUTION Culture", selectedphase: "option1", no: "Batch " },
    {
      title: "8 Behaviour Competencies",
      selectedphase: "option1",
      no: "Batch ",
    },
    { title: "SOLUTION Culture", selectedphase: "option2", no: "Batch " },
    {
      title: "8 Behaviour Competencies",
      selectedphase: "option2",
      no: "Batch ",
    },
    { title: "SOLUTION Culture", selectedphase: "option3", no: "Batch " },
    {
      title: "8 Behaviour Competencies",
      selectedphase: "option3",
      no: "Batch ",
    },
    { title: "SOLUTION Culture", selectedphase: "option4", no: "Batch " },
    {
      title: "8 Behaviour Competencies",
      selectedphase: "option4",
      no: "Batch ",
    },
  ];

  // Daftar pertanyaan untuk topik "SOLUTION Culture" dan "8 Behaviour Competencies"
  const questionsData = {
    Solution: [
      { title2: "Solution", question_id: "qs1", question: "Bersikap dengan sopan dan ramah", category: "Serve" },
      { title2: "Solution", question_id: "qs2", question: "Menunda-nunda pekerjaan", category: "Open-Mind" },
      { title2: "Solution", question_id: "qs3", question: "Mematuhi semua peraturan yang berlaku", category: "Leadership" },
      { title2: "Solution", question_id: "qs4", question: "Mengelola waktu secara efisien", category: "Uniqueness" },
      {
        title2: "Solution", question_id: "qs5",
        question: "Memiliki semangat juang dan pantang menyerah", category: "Totality"
      },
      {
        title2: "Solution", question_id: "qs6",
        question: "Berani mengambil peran positif untuk menyelesaikan masalah", category: "Innovative"
      },
      {
        title2: "Solution", question_id: "qs7",
        question:
          "Menolak keceriaan di lingkungan kerja (terlalu kaku & formal)", category: "Open-Mind"
      },
      {
        title2: "Solution", question_id: "qs8",
        question:
          "Mampu memotivasi diri sendiri untuk berpikir & bertindak berbeda dari biasanya", category: "Uniqueness"
      },
      {
        title2: "Solution", question_id: "qs9",
        question: "Menunjukkan kesesuaian kata dan perbuatan", category: "Totality"
      },
      {
        title2: "Solution", question_id: "qs10",
        question: "Merupakan pribadi yang penuh rasa ingin tahu", category: "Open-Mind"
      },
      {
        title2: "Solution", question_id: "qs11",
        question:
          "Melihat tantangan sebagai peluang untuk melakukan perbaikan atau inovasi", category: "Innovative"
      },
      { title2: "Solution", question_id: "qs12",
        question: "Pribadi yang mudah beradaptasi" , category: "Networking"},
      {
        title2: "Solution", question_id: "qs13",
        question:
          "Menjaga hubungan internal atau eksternal yang terbentuk secara efektif", category: "Networking"
      },
      {
        title2: "Solution", question_id: "qs14",
        question:
          "Menerima masukkan, kritik, dan saran untuk mengembangkan kualitas diri", category: "Open-Mind"
      },
    ],
    Behaviour: [
      {
        title2: "8 Behaviour Competencies", question_id: "qbc1",
        question:
          "Memahami arah bisnis perusahaan di masa datang dan menerjemahkan pemahaman tersebut ke dalam strategi jangka pendek & jangka panjang", category: "VBS"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc2",
        question: "Mampu merumuskan strategi secara jelas dan terukur", category: "VBS"
      },
      {
        title2: "8 Behaviour Competencies" , question_id: "qbc3",
        question:
          "Memiliki keterampilan membangun hubungan yang konstruktif dan efektif", category: "IS"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc4",
        question:
          "Mampu menyampaikan pandangan atau ide secara jelas dan percaya diri", category: "IS"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc5",
        question: "Terbuka pada feed back (umpan balik)", category: "CF"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc6",
        question:
          "Melakukan layanan pelanggan yang unggul (customer delight) di unit kerjanya", category: "CF"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc7",
        question:
          "Mampu mengidentifikasi akar suatu permasalahan dengan mengumpulkan dan menganalisa data yang tersedia", category:"AJ"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc8",
        question:
          "Mampu berpikir kreatif dan mengusulkan alternatif solusi dari suatu permasalahan", category: "AJ"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc9",
        question:
          "Fokus pada tujuan organisasi dengan menurunkannya ke dalam obyektif dan rencana kerja", category: "PDA"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc10",
        question: "Menerapkan PDCA dalam pekerjaan", category: "PDA"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc11",
        question:
          "Mampu memimpin tim dengan mengarahkan dan mendelegasikan tugas berdasarkan tuntutan pekerjaan yang sesuai dengan kemampuan dan kepribadiannya",
        category: "LM"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc12",
        question:
          "Berperilaku sesuai SOLUTION dalam kapasitasnya sebagai pemimpin", category: "LM"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc13",
        question:
          "Menyelesaikan tugas secara antusias dan optimis, dengan target kualitas yang tinggi", category: "DC"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc14",
        question:
          "Memiliki kemauan dan usaha untuk mempelajari pengetahuan, keterampilan dan budaya baru", category: "DC"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc15",
        question:
          "Membina kerja sama yang efektif dengan berbagai pihak dalam rangka penyelesaian tugas", category: "TW"
      },
      {
        title2: "8 Behaviour Competencies", question_id: "qbc16",
        question:
          "Mempertimbangkan perbedaan individu, menghormati perbedaan yang ada, dan memanfaatkan secara positif keragaman yang ada", category: "TW"
      },
    ],
  };

  const handleMain = () => {
    setCurrentPage("main");
    setSelectedTask(null);
    setSelectedQuestion(null);
    setSelectedPeer(null);
    setAnswers({});
  };
  

  useEffect(() => {
    const fetchBatch = async () => {
      try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:3001/profile", {
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              },
          });
          const data = response.data;
          console.log("Fetched profile data:", data);
          const userProfile = data.user;

          setBatchNumber(userProfile.BATCH);
      } catch (error) {
          console.error("Error fetching profile data:", error);
      }
  };
  

  const fetchPeers = async () => {
    if (batchNumber){
      try {
        const phaseMap = {
          option1: 0,
          option2: 1,
          option3: 2,
          option4: 3,
        };

        const topicMap = {
          "SOLUTION Culture": 1,
          "8 Behaviour Competencies": 2,
        };

        const response = await axios.get(`${baseURL}/assessment/getPeersFS`, {
          params: {
            phase: phaseMap[phase],
            topic: selectedTask ? topicMap[selectedTask.title] : null,
            batch: batchNumber,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        setPeerList(response.data.people);
        console.log(response.data.people);
      } catch (error) {
        console.error("Error fetching peers:", error);
      }
    }
  };

    fetchBatch();
    if (selectedTask){
      fetchPeers();
    }
      
  },[phase, selectedTask]);



  const handleSecond = (task, role) => {
    setSelectedTask(task);
    if (role === "mtList") {
      setCurrentPage("peerList");
    }
  };

  const handlePeerSelected = (person) => {
    if (person.STATUS === "Not Yet") {
      setSelectedPeer(person);
      setCurrentPage("second");
      setSelectedQuestion(
        selectedTask.title === "SOLUTION Culture"
          ? "Solution"
          : "8 Behaviour Competencies"
      );
    }
  };

  const handleAnswerClick = (questionIndex, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: value,
    }));
  };

  const handleSubmit = async () => {
    const questions =
      selectedTask.title === "SOLUTION Culture"
        ? questionsData.Solution
        : questionsData.Behaviour;
  
    // Check if all questions have been answered
    for (let i = 0; i < questions.length; i++) {
      if (!answers.hasOwnProperty(i)) {
        alert("Ada pertanyaan yang belum diisi");
        return;
      }
    }
  
    // Map phase to its corresponding value
    const phaseMap = {
      option1: "10",
      option2: "20+70 OJT1",
      option3: "20+70 OJT2",
      option4: "20+70 OJT3",
    };
  
    const selectedQuestions = 
    selectedTask.title === "SOLUTION Culture"
    ? questionsData.Solution
    : questionsData.Behaviour;

    const assessmentData = {
      phase: phaseMap[phase],
      assessmentTopic: selectedTask.title,
      peerID: selectedPeer ? selectedPeer.ACCOUNTID : undefined,
      answer: Object.values(answers), // Convert answers to an array of values
      questions: selectedQuestions.map(q => q.question),
      categories: selectedQuestions.map(q => q.category),
    };
  
    try {
      const response = await axios.post(
        `${baseURL}/assessment`,
        assessmentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert(response.data.message);
      handleMain();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("An assessment with the same parameters already exists");
      } else {
        console.error("Error submitting assessment:", error);
        alert("Failed to send your feedback");
      }
    }
  };
  

  const renderCard = () => {
    const filteredPhase = cards.filter((card) => card.selectedphase === phase);
      return (
        <div className="selfpeer-container-fs">
          {filteredPhase.map((selfpeer, index) => (
              <div className="selfpeer-item-fs">
                <div className="description-fs">
                  <div className="selfpeer-text-fs">
                    <div className="selfpeer-title-fs">
                      <b>{selfpeer.title}</b>
                    </div>
                    <div className="selfpeer-batch-fs">Batch 1</div>
                  </div>         
                </div>
  
                <div className="fs-Button">                             
                  <div className="button-fs">
                    <span className="right" onClick={() => handleSecond(selfpeer, "mtList")}
                      >Take the assessment
                    </span>
                  </div>               
                </div>
              </div>
          ))}
        </div>
      );
  };
  
    const renderQuestion = () => {
      const questions =
        selectedTask.title === "SOLUTION Culture"
          ? questionsData.Solution
          : questionsData.Behaviour;
  
      const scale =
        selectedTask.title === "8 Behaviour Competencies"
          ? [1, 2, 3, 4, 5]
          : [1, 2, 3, 4];
  
      return questions.map((question, index) => (
        <div key={index}>
          {index + 1}. {question.question}
          <div className="buttonPosition">
            {scale.map((value) => (
              <button
                key={value}
                className={`btnGhost ${
                  answers[index] === value ? "selected" : ""
                }`}
                onClick={() => handleAnswerClick(index, value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ));
    };
  
    const renderPage = () => {
      switch (currentPage) {
        case "main":
          return (
            <div className="selfpeer">
              <div className="title1">
                <h>
                  <b>Assessment</b>
                </h>
              </div>
              <div className="Dropdown">
                <div className="phasetitle">
                  <a>Phase</a>
                  <select
                    className="phaseselect"
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                  >
                    <option value="option1">Phase 10</option>
                    <option value="option2">Phase 20+70 OJT1</option>
                    <option value="option3">Phase 20+70 OJT2</option>
                    <option value="option4">Phase 20+70 OJT3</option>
                  </select>
                </div>
              </div>
              <hr />
              <div className="selfpeer-rc">{renderCard()}</div>
            </div>
          );
        case "second":
          return (
            <div className="selfpeer">
              <div className="back-header">
                <img
                  className="backbutton"
                  onClick={handleMain}
                  src="/src/files/icons/backbutton.png"
                  alt="Back Button"
                />
                <h>
                  <b>{selectedQuestion}</b>
                </h>
              </div>
              <hr />
              <div className="question-container">
                {renderQuestion()}
                <div className="submitButton">
                  <button className="submit" onClick={handleSubmit}>
                    {" "}
                    <b>Submit</b>{" "}
                  </button>
                </div>
              </div>
              <div className="question-container-scale">
                <h>
                  <b>Skala Penilaian</b>
                </h>
                <p className="numberOne">1 &nbsp;&nbsp; Sangat Tidak Sesuai </p>
                <p className="numberTwo">2 &nbsp;&nbsp; Tidak Sesuai </p>
                {selectedTask.title === "8 Behaviour Competencies" ? (
                  <>
                    <p className="numberThree">3 &nbsp;&nbsp; Cukup Sesuai </p>
                    <p className="numberFour">4 &nbsp;&nbsp; Sesuai </p>
                    <p className="numberFive">5 &nbsp;&nbsp; Sangat Sesuai </p>
                  </>
                ) : (
                  <>
                    <p className="numberThree">3 &nbsp;&nbsp; Sesuai </p>
                    <p className="numberFour">4 &nbsp;&nbsp; Sangat Sesuai </p>
                  </>
                )}
              </div>
            </div>
          );
        case "peerList":
          return (
            <div className="selfpeer">
              <div className="back-header">
                <img
                  className="backbutton"
                  src="/src/files/icons/backbutton.png"
                  onClick={handleMain}
                  alt="Back Button"
                />
                <h>
                  <b>Daftar Nama MT</b>
                </h>
              </div>
              <hr />
              <div className="table-PL">
                <div className="table-header">
                  <div className="peer-no">No</div>
                  <div className="peer-name">Nama</div>
                  <div className="peer-status">Status</div>
                </div>
                <div className="peer-list">
                  {peerList.map((person, index) => (
                    <div
                    key={index}
                    className={`peer-item ${
                      person.STATUS === "Not Yet" ? "clickable" : ""
                    }`}
                    onClick={() => handlePeerSelected(person)}
                      >
                    <div className="peer-no">{index + 1}</div>
                    <div className="peer-name">{person.NAMA}</div>
                    <div className="peer-status">
                      {person.STATUS}
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    };
  
    return <div>{renderPage()}</div>;
  };
  
  export default SelfPeer;
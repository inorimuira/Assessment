const connectToDatabase = require("../config/database");
const verifyToken = require("../config/jsonwebtoken");
const { customAlphabet } = require("nanoid");

const addAssessment = async (request, h) => {
  let decoded;
  try {
    decoded = verifyToken(request);
    console.log("Token verified:", decoded);
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return h.response({ message: "Invalid token" }).code(401);
  }

  const id = decoded.id;
  if (!id) {
    console.error("ID not found in token");
    return h.response({ message: "ID not found in token" }).code(404);
  }

  let connection;
  try {
    const pool = await connectToDatabase();
    connection = await pool.getConnection();
  } catch (err) {
    console.error("Failed to connect to database:", err.message);
    return h.response({ message: "Database connection failed" }).code(500);
  }

  const { phase, assessmentTopic, peerID, answer, questions, categories } = request.payload;
  console.log("Received parameters:", {
    phase,
    assessmentTopic,
    peerID,
    answer,
    questions,
    categories,
  });

  const senderID = id;
  const receiverID = peerID || id;

  try {
    const [existingAssessment] = await connection.execute(
      "SELECT * FROM assessment WHERE PHASE = ? AND ASSESSMENTTOPIC = ? AND SENDER = ? AND RECEIVER = ? AND STATUS = ?",
      [phase, assessmentTopic, senderID, receiverID, "Done"]
    );

    if (existingAssessment.length > 0) {
      return h
        .response({
          message: "An assessment with the same parameters already exists",
        })
        .code(409);
    }

    const [userBatch] = await connection.execute(
      "SELECT Batch FROM master_User WHERE ACCOUNTID = ?",
      [id]
    );

    if (userBatch.length === 0) {
      return h.response({ message: "User batch not found" }).code(404);
    }

    const batch = userBatch[0].Batch;
    const status = "Done";
    const nanoidNumbers = customAlphabet("0123456789", 8);
    const assessmentid = nanoidNumbers();

    await connection.execute(
      "INSERT INTO assessment (ASSESSMENTID, PHASE, ASSESSMENTTOPIC, QUESTION, CATEGORY, ANSWER, SENDER, RECEIVER, STATUS, CREATED_AT, Batch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)",
      [
        assessmentid,
        phase,
        assessmentTopic,
        JSON.stringify(questions),
        JSON.stringify(categories),
        JSON.stringify(answer),
        id,
        receiverID,
        status,
        batch
      ]
    );

    return h
      .response({ message: "Your feedback successfully sent." })
      .code(200);
  } catch (error) {
    console.error("Error inserting assessment:", error);
    return h.response({ message: "Failed to send your feedback" }).code(500);
  } finally {
    if (connection) connection.release();
  }
};

const getPeers = async (request, h) => {
  let decoded;
  try {
    decoded = verifyToken(request);
    console.log("Token verified:", decoded);
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return h.response({ message: "Invalid token" }).code(401);
  }

  const id = decoded.id;
  if (!id) {
    return h.response({ message: "ID not found in token" }).code(404);
  }

  const phase = request.query.phase;
  console.log("Phase:", phase);
  const topic = request.query.topic;
  console.log("Topic:", topic);

  const pool = await connectToDatabase();
  const connection = await pool.getConnection();

  const phaseMapping = {
    0: "10",
    1: "20+70 OJT1",
    2: "20+70 OJT2",
    3: "20+70 OJT3",
  };

  const topicMapping = {
    1: "SOLUTION Culture",
    2: "8 Behaviour Competencies",
  };

  let phaseType = phaseMapping[phase];
  console.log("PhaseType:", phaseType);
  let assessmentTopic = topicMapping[topic];
  console.log("Assessment:", assessmentTopic);

  if (!phaseType || !assessmentTopic) {
    return h.response({ message: "Invalid type parameter" }).code(400);
  }

  try {
    const [userBatch] = await connection.execute(
      "SELECT Batch FROM master_User WHERE ACCOUNTID = ?",
      [id]
    );

    if (userBatch.length === 0) {
      return h.response({ message: "User batch not found" }).code(404);
    }

    let batch = userBatch[0].Batch;
    

    if (batch === 0) {
      const [nonZeroBatches] = await connection.execute(
        "SELECT DISTINCT Batch FROM master_User WHERE Batch > 0"
      );
      if (nonZeroBatches.length > 0) {
        batch = nonZeroBatches[0].Batch;
      } else {
        return h.response({ message: "No valid batch found" }).code(404);
      }
    }

    const [people] = await connection.execute(
      "SELECT mu.NAMA, mu.ACCOUNTID, IFNULL(a.STATUS, 'Not Yet') AS STATUS " +
        "FROM master_User mu " +
        "LEFT JOIN assessment a ON mu.ACCOUNTID = a.RECEIVER AND a.PHASE = ? AND a.ASSESSMENTTOPIC = ? " +
        "WHERE mu.ACCOUNTID != ? AND mu.BATCH = ?",
      [phaseType, assessmentTopic, id, batch]
    );

    return h.response({ people }).code(200);
  } catch (err) {
    console.error(err);
    return h
      .response({ message: "Failed to load participants data" })
      .code(500);
  } finally {
    connection.release();
  }
};

const getPeersFS = async (request, h) => {
  let decoded;
  try {
    decoded = verifyToken(request);
    console.log("Token verified:", decoded);
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return h.response({ message: "Invalid token" }).code(401);
  }

  const id = decoded.id;
  if (!id) {
    return h.response({ message: "ID not found in token" }).code(404);
  }

  const phase = request.query.phase;
  console.log("Phase:", phase);
  const topic = request.query.topic;
  console.log("Topic:", topic);

  const pool = await connectToDatabase();
  const connection = await pool.getConnection();

  const phaseMapping = {
    0: "10",
    1: "20+70 OJT1",
    2: "20+70 OJT2",
    3: "20+70 OJT3",
  };

  const topicMapping = {
    1: "SOLUTION Culture",
    2: "8 Behaviour Competencies",
  };

  let phaseType = phaseMapping[phase];
  console.log("PhaseType:", phaseType);
  let assessmentTopic = topicMapping[topic];
  console.log("Assessment:", assessmentTopic);

  if (!phaseType || !assessmentTopic) {
    return h.response({ message: "Invalid type parameter" }).code(400);
  }

  try {  
    const [userBatch] = await connection.execute(  
     "SELECT Batch FROM master_User WHERE ACCOUNTID = ?",  
     [id]  
    );  
   
    if (userBatch.length === 0) {  
     return h.response({ message: "User batch not found" }).code(404);  
    }  
   
    let batch = userBatch[0].Batch;  
   
    batch = 1;

    console.log("User batch:", userBatch[0].Batch); // Untuk melihat nilai batch asli
    console.log("Using batch for query:", batch); // Untuk melihat nilai batch yang digunakan

   
    const [people] = await connection.execute(  
     "SELECT mu.NAMA, mu.ACCOUNTID, IFNULL(a.STATUS, 'Not Yet') AS STATUS " +  
       "FROM master_User mu " +  
       "LEFT JOIN assessment a ON mu.ACCOUNTID = a.RECEIVER AND a.PHASE = ? AND a.ASSESSMENTTOPIC = ? " +  
       "WHERE mu.ACCOUNTID != ? AND mu.BATCH = ?",  
     [phaseType, assessmentTopic, id, batch]  
    );  

    console.log(people); // Tambahkan ini untuk debugging
    return h.response({ people }).code(200);  
   }    
   catch (err) {  
    console.error(err);  
    return h.response({ message: "Failed to load participants data" }).code(500);  
   } finally {  
    connection.release();  
   }  
};


module.exports = {
  addAssessment,
  getPeers,
  getPeersFS

};

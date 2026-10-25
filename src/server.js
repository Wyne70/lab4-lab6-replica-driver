const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = 3000;

// MongoDB Replica Set connection
const MONGODB_URI =
  "mongodb://mongo1:27017,mongo2:27017,mongo3:27017/lab4_lab6?replicaSet=rs0";

const DATABASE_NAME = "lab4_lab6";
const COLLECTION_NAME = "species";

let db;
let speciesCollection;

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "MongoDB Replica Set CRUD API",
    database: DATABASE_NAME,
    collection: COLLECTION_NAME,
    endpoints: {
      getAll: "GET /api/species",
      getOne: "GET /api/species/:id",
      create: "POST /api/species",
      update: "PUT /api/species/:id",
      delete: "DELETE /api/species/:id",
      replicaStatus: "GET /api/replica-status",
    },
  });
});

// CREATE: Add a new species
app.post("/api/species", async (req, res) => {
  try {
    const {
      name,
      category,
      habitat,
      conservationStatus,
    } = req.body;

    if (
      !name ||
      !category ||
      !habitat ||
      !conservationStatus
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide name, category, habitat, and conservationStatus.",
      });
    }

    const newSpecies = {
      name: name.trim(),
      category: category.trim(),
      habitat: habitat.trim(),
      conservationStatus: conservationStatus.trim(),
      createdAt: new Date(),
    };

    const result = await speciesCollection.insertOne(newSpecies);

    res.status(201).json({
      success: true,
      message: "Species created successfully.",
      insertedId: result.insertedId,
      data: newSpecies,
    });
  } catch (error) {
    console.error("Create error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create species.",
    });
  }
});

// READ: Get all species
app.get("/api/species", async (req, res) => {
  try {
    const species = await speciesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      count: species.length,
      data: species,
    });
  } catch (error) {
    console.error("Read error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve species.",
    });
  }
});

// READ: Get one species by ID
app.get("/api/species/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid species ID.",
      });
    }

    const species = await speciesCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!species) {
      return res.status(404).json({
        success: false,
        message: "Species not found.",
      });
    }

    res.json({
      success: true,
      data: species,
    });
  } catch (error) {
    console.error("Read-one error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve species.",
    });
  }
});

// UPDATE: Update an existing species
app.put("/api/species/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid species ID.",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "habitat",
      "conservationStatus",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (
          typeof req.body[field] !== "string" ||
          !req.body[field].trim()
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a non-empty string.`,
          });
        }

        updates[field] = req.body[field].trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    const result = await speciesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Species not found.",
      });
    }

    const updatedSpecies = await speciesCollection.findOne({
      _id: new ObjectId(id),
    });

    res.json({
      success: true,
      message: "Species updated successfully.",
      data: updatedSpecies,
    });
  } catch (error) {
    console.error("Update error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update species.",
    });
  }
});

// DELETE: Remove a species
app.delete("/api/species/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid species ID.",
      });
    }

    const result = await speciesCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Species not found.",
      });
    }

    res.json({
      success: true,
      message: "Species deleted successfully.",
    });
  } catch (error) {
    console.error("Delete error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete species.",
    });
  }
});

// REPLICA SET STATUS
app.get("/api/replica-status", async (req, res) => {
  try {
    const admin = db.admin();
    const status = await admin.command({ replSetGetStatus: 1 });

    res.json({
      success: true,
      set: status.set,
      members: status.members.map((member) => ({
        name: member.name,
        state: member.stateStr,
        health: member.health,
      })),
    });
  } catch (error) {
    console.error("Replica status error:", error);

    res.status(500).json({
      success: false,
      message: "Could not retrieve replica set status.",
      error: error.message,
    });
  }
});

// Connect to MongoDB before starting the server
async function startServer() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();

    db = client.db(DATABASE_NAME);
    speciesCollection = db.collection(COLLECTION_NAME);

    console.log("Connected to MongoDB Replica Set!");
    console.log(`Database: ${DATABASE_NAME}`);
    console.log(`Collection: ${COLLECTION_NAME}`);

    const hello = await db.admin().command({ hello: 1 });
    console.log(`Replica set: ${hello.setName}`);
    console.log(`Primary: ${hello.primary}`);

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    await client.close().catch(() => {});
    process.exit(1);
  }
}

startServer();
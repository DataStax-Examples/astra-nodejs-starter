require("dotenv").config();
const { createAstraClient } = require("@astrajs/client");
const { Client } = require("cassandra-driver");

// anonymous funtion to support async commands in versions of
// NodeJS that are older than 14.8.0
(async () => {
  // connect using an @astrajs/client
  const astraClient = await createAstraClient({
    astraDatabaseId: process.env.ASTRA_DB_ID,
    astraDatabaseRegion: process.env.ASTRA_DB_REGION,
    applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
  });

  // get a database
  const database = await astraClient.ops.getDatabase(process.env.ASTRA_DB_ID);
  console.log("Your database is:", database);

  // create a user
  const userCollection = astraClient.collections
    .namespace(process.env.ASTRA_DB_KEYSPACE)
    .collection("sag_users");
  const user = await userCollection.create({ name: "Cliff Wicklow" });
  console.log("Created:", user);

  // connect using the C* driver
  const client = new Client({
    cloud: {
      // replace with the path to your secure connect bundle
      secureConnectBundle: "./secure-connect-bundle.zip",
    },
    credentials: {
      username: "token",
      password: process.env.ASTRA_DB_APPLICATION_TOKEN,
    },
  });

  await client.connect();

  // Execute a query
  const rs = await client.execute("SELECT * FROM system.local");
  console.log(`Your cluster returned ${rs.rowLength} row(s)`);

  await client.shutdown();
})();

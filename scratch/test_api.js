async function testAPI() {
  try {
    const res = await fetch('http://droplet.sewen.me:8080/api/telemetry/history?hours=24');
    const data = await res.json();
    console.log("Telemetry Count:", data.length);
    if (data.length > 0) {
      console.log("First record:", data[0]);
    }
  } catch (err) {
    console.error("Error fetching telemetry:", err);
  }
}
testAPI();

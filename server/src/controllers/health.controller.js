export function getHealth(req, res) {
  res.json({
    status: "ok",
    service: "CuraLink Research Assistant API",
    timestamp: new Date().toISOString(),
  });
}


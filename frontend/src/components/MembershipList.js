import React, { useState, useEffect } from "react";
import axios from "axios";

const MembershipList = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");
  console.log("token in frontend",token)
  let userId = null;

  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      userId = decodedToken.userId;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  useEffect(() => {
    const fetchMemberships = async () => {
      if (!userId) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/membership?userId=${userId}`, {
          headers: { "x-auth-token": localStorage.getItem("authToken") },
        });

        setMemberships(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching memberships:", error);
        setError("Failed to load memberships.");
        setLoading(false);
      }
    };

    fetchMemberships();
  }, [userId, token]);

  return (
    <div className="container mt-4">
      <h2 className="text-center">Professional Memberships</h2>

      {loading ? (
        <p className="text-center">Loading memberships...</p>
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : memberships.length === 0 ? (
        <p className="text-center">No memberships found.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {memberships.map((membership) => (
            <div className="col" key={membership.membershipId}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{membership.membershipBody}</h5>
                  <p className="card-text">
                    <strong>Member:</strong> {membership.name} <br />
                    <strong>Type:</strong> {membership.membershipType} <br />
                    <strong>Year:</strong> {membership.membershipYear} <br />
                    {membership.expiryDate && membership.membershipType !== "Lifetime" && (
                      <>
                        <strong>Expiry:</strong> {membership.expiryDate} <br />
                      </>
                    )}
                  </p>
                </div>
                <div className="card-footer">
                  <small className="text-muted">Last updated: {membership.lastUpdated}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembershipList;

import styled from "@emotion/styled";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  color: white;
`;

const StyledInput = styled.input`
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const StyledSelect = styled.select`
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const SLUG_WORKS = [
  "car",
  "dog",
  "computer",
  "person",
  "inside",
  "word",
  "for",
  "please",
  "to",
  "cool",
  "open",
  "source",
];
const BASE_URL = "http://localhost:3001";

function getRandomSlug() {
  let slug = "";
  for (let i = 0; i < 3; i++) {
    slug += SLUG_WORKS[Math.floor(Math.random() * SLUG_WORKS.length)];
  }
  return slug;
}

const Landing = () => {
  const [language, setLanguage] = useState("node");
  const [replId, setReplId] = useState(getRandomSlug());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleProjectCreate = async () => {
    setLoading(true);
    await axios.post(`${BASE_URL}/project`, { replId, language });
    navigate(`/project?replId=${replId}`);
    setLoading(false);
  };
  return (
    <Container>
      <Title>Replit</Title>
      <StyledInput
        type="text"
        placeholder="Repl ID"
        onChange={(e) => setReplId(e.target.value)}
        value={replId}
      />
      <StyledSelect
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="node">Node.js</option>
        <option value="python">Python</option>
      </StyledSelect>
      <StyledButton onClick={handleProjectCreate} disabled={loading}>
        {loading ? "Creating..." : "Create Project"}
      </StyledButton>
    </Container>
  );
};

export default Landing;

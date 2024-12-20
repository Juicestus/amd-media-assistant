// import Header from "../components/Header";
import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, OverlayTrigger, Popover, Row, Table } from "react-bootstrap";
import { Navigate, useBeforeUnload, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ArticleDirectory } from "../data";
import { addArticleDirectory, getArticleDirectories } from "../api";

// import MenuIcon from '@mui/icons-material/Menu';

export default () => {

  const navigate = useNavigate();

  const [ articleDirectories, setArticleDirectories ] = useState<ArticleDirectory[]>([]);

  useEffect(() => {
    getArticleDirectories().then(ad => setArticleDirectories(ad));
  }, [setArticleDirectories]);

  const [ createName, setCreateName ] = useState("");
  const [ createUrl, setCreateUrl ] = useState("");

  const addArticleDirectoryEvent = () => {
    addArticleDirectory(createName, createUrl).then(_ => {
      setCreateName("");
      setCreateUrl("");
      getArticleDirectories().then(ad => setArticleDirectories(ad));
    });
  }

  return (
    <>
      <Header fluid/>

      {/* <Container style={{ maxWidth: "40rem" }} fluid> */}
      <Container>

        <br></br>
        <h1> Link Directories </h1>
        <br></br>
        <p>Manage pages that contain links to articles.</p>
        <br></br>
        <br></br>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
                <td>
                <Form.Control 
                  type="text" 
                  placeholder="Name" 
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
                </td>
                <td>
                <Form.Control 
                  type="text" 
                  placeholder="URL" 
                  value={createUrl}
                  onChange={(e) => setCreateUrl(e.target.value)}
                />
                </td>
              <td className="ad-btn-col">
                <Button className="ad-btn" onClick={_ => addArticleDirectoryEvent()}>Add</Button>
              </td>
            </tr>
            {articleDirectories.map((ad, i) => (
              <tr key={ad.id}>
                <td>{ad.id}</td>
                <td>{ad.url}</td>
                <td className="ad-btn-col">
                  <Button className="ad-btn">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

      </Container>
    </>
  );
};
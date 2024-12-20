// import Header from "../components/Header";
import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, OverlayTrigger, Popover, Row, Table } from "react-bootstrap";
import { Navigate, useBeforeUnload, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Article, ArticleDirectory } from "../data";
import { getArticlePreviews } from "../api";

export default () => {

  const navigate = useNavigate();

  const [ articles, setArticles ] = useState<Article[]>([]);

  useEffect(() => {
    getArticlePreviews().then(a => setArticles(a));
  }, [setArticles]);


  return (
    <>
      <Header fluid/>

      <Container>

        <br></br>
        <h1> Scraped Articles </h1>
        <br></br>
        <p>Analyze articles collected by the webscraper.</p>
        <br></br>
        <br></br>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Site</th>
              {/* <th>URL</th> */}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a, i) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.category}</td>
                <td>{a.site}</td>
                {/* <td>{a.url}</td> */}
                <td className="ad-btn-col">
                  <Button className="ad-btn" onClick={() => navigate(a.id)}>View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

      </Container>
    </>
  );
};
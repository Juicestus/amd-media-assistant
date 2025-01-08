// import Header from "../components/Header";
import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, OverlayTrigger, Popover, Row, Table } from "react-bootstrap";
import { Navigate, useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { Article, ArticleDirectory, blobUrl } from "../data";
import { getArticle, getArticlePreviews } from "../api";

export default () => {

  const navigate = useNavigate();

  const param = useParams();

  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    console.log(param.id);
    getArticle(param.id ?? "").then(a => setArticle(a));
  }, [setArticle]);


  return (
    <>
      <Header fluid />

      <Container>

        <br></br>
        <h1> Article Details </h1>
        <br></br>
        <p>Analyze the details of an article collected by the webscraper.</p>
        <br></br>
        <br></br>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Value</th>
            </tr>
          </thead>
          {article && (
            <tbody>
              <tr>
                <td>Title</td>
                <td>{article.title}</td>
              </tr>
              <tr>
                <td>Category</td>
                <td>{article.category}</td>
              </tr>
              <tr>
                <td>Site</td>
                <td>{article.site}</td>
              </tr>
              <tr>
                <td>URL</td>
                <td><a href={article.url}>{article.url}</a></td>
              </tr>
              <tr>
                <td>Title Audio</td>
                <td><a href={blobUrl(article, 'title')}>Download</a></td>
              </tr>
              <tr>
                <td>Content Audio</td>
                <td><a href={blobUrl(article, 'title')}>Download</a></td>
              </tr>
              <tr>
                <td>Content</td>
                <td>{article.content}</td>
              </tr>

              {/* <td className="ad-btn-col"> */}
              {/* <Button className="ad-btn" onClick={() => navigate(article.url)}>View</Button> */}
              {/* </td> */}
            </tbody>
          )}
        </Table>

      </Container>
    </>
  );
};
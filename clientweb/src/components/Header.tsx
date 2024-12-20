import { Button, Container, Nav, Navbar } from "react-bootstrap";
import npmPackage from "../../package.json";

const Header = ({fluid}: {fluid?: boolean}) => {
  return (
    <Navbar className="header">
      <Container fluid>
        <Navbar.Brand href="/" className="">
            AMD Assistant - Web Dashboard
        </Navbar.Brand>
        <Nav className="me-auto">
          {/* <Nav.Link href="/directories"> */}
            <Nav.Link href="/directories">Link Directories</Nav.Link>
          {/* </Nav.Link> */}
          {/* <Nav.Link href="/articles"> */}
            <Nav.Link href="/articles">Scraped Articles</Nav.Link>
          {/* </Nav.Link> */}
        </Nav>
        <Navbar.Text className="npm-version">{`v. ${npmPackage.version}`}</Navbar.Text>
      </Container>
    </Navbar>
  );
};
export default Header;
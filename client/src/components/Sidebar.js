import React, {useState, useEffect} from 'react';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';

const Sidebar = ({activeSection, onSelectCategory}) => {
  const [sidebarTop, setSidebarTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setSidebarTop(window.scrollY > 100 ? window.scrollY - 80 : 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{position: 'absolute', top: `${sidebarTop}px`, transition: 'top 0.3s ease'}}>
      <Tab.Container id="left-tabs-example" activeKey={activeSection || null}>
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item style={{whiteSpace: 'nowrap'}}>
                <Nav.Link
                  style={
                    activeSection === 'accommodations' ? activeTabStyle : defaultTabStyle
                  }
                  eventKey="accommodations"
                  onClick={() => onSelectCategory('accommodations')}>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item style={{whiteSpace: 'nowrap'}}>
                <Nav.Link
                  style={
                    activeSection === 'tourTicket' ? activeTabStyle : defaultTabStyle
                  }
                  eventKey="tourTicket"
                  onClick={() => onSelectCategory('tourTicket')}>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
};

const activeTabStyle = {
  backgroundColor: '#007bff',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: '5px'
};

const defaultTabStyle = {
  backgroundColor: 'transparent',
  color: '#000'
};

export default Sidebar;

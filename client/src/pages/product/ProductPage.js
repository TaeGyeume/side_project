import React, {useRef, useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import TourTicketList from '../../components/product/tourTicket/TourTicketList';
import AccommodationList from '../../pages/product/accommodations/AccommodationList';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSquarePlus} from '@fortawesome/free-solid-svg-icons';

const ProductPage = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState(null);

  const accommodationsRef = useRef(null);
  const tourTicketRef = useRef(null);

  const scrollToSection = section => {
    const sectionRefs = {
      accommodations: accommodationsRef,
      tourTicket: tourTicketRef
    };

    setActiveSection(section);
    sectionRefs[section]?.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setActiveSection(null);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{display: 'flex', position: 'relative'}}>
      <Sidebar activeSection={activeSection} onSelectCategory={scrollToSection} />

      <div style={{padding: '20px', flex: 1}}>
        <div id="accommodations" ref={accommodationsRef} style={sectionStyle}>
          <AccommodationList />
        </div>

        <div id="tourTicket" ref={tourTicketRef} style={sectionStyle}>
          <div style={headerContainerStyle}>
            <FontAwesomeIcon
              icon={faSquarePlus}
              onClick={() => navigate('/product/tourTicket/list')}
              style={plusButtonStyle}
            />
          </div>
          <TourTicketList />
        </div>
      </div>
    </div>
  );
};

const sectionStyle = {
  border: '1px solid #ddd',
  padding: '20px',
  marginBottom: '20px',
  marginLeft: '150px',
  position: 'auto',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9'
};

const headerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative'
};

const plusButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  fontSize: '20px',
  fontWeight: 'bold',
  cursor: 'pointer',
  // backgroundColor: '#007bff',
  // color: '#fff',
  border: 'none',
  // borderRadius: '50%',
  width: '30px',
  height: '30px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
  // boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
};

export default ProductPage;

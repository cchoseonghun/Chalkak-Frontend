import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { Button, Container, InputGroup, Form, Row, Col, Card, Stack, ToggleButton } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import MeetupsCreateModal from './MeetupsCreateModal';
import MeetupsDetailModal from './MeetupsDetailModal';
import { setModalName, setShow } from '../../store/modal.slice';
import { setMeetup } from '../../store/meetup.slice';
import Loading from '../components/loading/Loading';
import apiAxios from '../../utils/api-axios';
import './MeetupsList.css';

const MeetupsList = () => {
  let state = useSelector((state)=> state );
  let dispatch = useDispatch();

  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputKeyword, setInputKeyword] = useState('');
  const [checkedMine, setCheckedMine] = useState(false);
  const [tempMeetups, setTempMeetups] = useState([]);

  const target = useRef(null);
  const page = useRef(1);
  const keyword = useRef('');

  useEffect(() => {
    observer.observe(target.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (checkedMine) {
      const myMeetups = meetups.filter((meetup) => {
        return meetup.userId === state.user.data.id;
      });
      setTempMeetups(meetups);
      setMeetups(myMeetups);
      document.querySelector('#scrollEnd').hidden = true;
    } else if (!checkedMine) {
      setMeetups(tempMeetups);
      setTimeout(() => {
        document.querySelector('#scrollEnd').hidden = false;
      }, 500);
    }
  }, [checkedMine])

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      if (loading) return;

      getMeetups(page.current, keyword.current);
      page.current += 1;
    });
  });

  return (
    <>
      { loading && <Loading /> }

      { state.modal.modalName === 'create' && <MeetupsCreateModal resetMeetups={resetMeetups} /> }
      { state.modal.modalName === 'detail' && 
        <MeetupsDetailModal 
          getMeetupDetail={getMeetupDetail} 
          resetMeetups={resetMeetups}
        /> 
      }
      <Container>
        <div className="d-flex align-items-center flex-column ChalkakSearch">
          <h2 className='ChalkakH2' onClick={()=>{window.location.reload()}} style={{ cursor: 'pointer' }}>같이 찍어요</h2>
          <InputGroup className="mb-5" style={{ width: '25rem' }}>
            <Form.Control type='text' className='searchInputForm' placeholder='키워드를 검색해보세요.' onChange={(e)=>{setInputKeyword(e.target.value)}} onKeyUp={pressEnterHandler}/>
            <Button className="searchInputFormBtn" onClick={goSearch}>검색</Button>
          </InputGroup>
        </div>

        <Stack direction="horizontal" gap={1} className="mb-2">
          <h2># {keyword.current === '' ? '전체' : keyword.current}</h2>
          {
            Object.keys(state.user.data).length > 0 ?
            <>
              <ToggleButton className={checkedMine ? 'ms-auto ActiveChalkakBtn' : 'ms-auto ChalkakBtn'} id="toggle-check" type="checkbox" variant="outline-dark" checked={checkedMine} onChange={(e) => setCheckedMine(e.currentTarget.checked)}>나의 모임</ToggleButton>
              <Button className="ChalkakBtn" variant="outline-dark" onClick={()=>{showModal('create')}}>모임 추가</Button>
            </> : ''
          }
        </Stack>

        <Row xs={1} md={3} className="g-4 mb-3">
          {
            meetups.length > 0 ?
            meetups.map((meetup, i) => {
              let meetupCondition = '';
              const joinsFindResult = meetup.joins.find((join) => {
                return join.userId === state.user.data.id;
              })
              if (!_.isNil(joinsFindResult)) {
                meetupCondition = 'join';
              } else if (meetup.joins.length === meetup.headcount) {
                meetupCondition = 'full';
              } else {
                meetupCondition = 'none';
              }
              return (
                <Col className="full" key={i} onClick={()=>{getMeetupDetail(meetup.id)}} style={{ cursor: 'pointer' }}>
                  <Card bg={meetupCondition === "none" ? "" : meetupCondition === "join" ? "success" : "secondary"}>
                    <Card.Header><b>{meetup.title} ({meetup.joins.length}/{meetup.headcount})</b></Card.Header>
                    <Card.Body style={{ height: '10rem' }}>
                    <Card.Text>주최자: {meetup.user.username}</Card.Text>
                      <Card.Title className='meetupContent'>{meetup.content}</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              )
            }) :
            <h3>데이터가 없습니다.</h3>
          }
        </Row>
        <div id="scrollEnd" style={{ height: "1px" }} ref={target}></div>
      </Container>
    </>
  )

  function pressEnterHandler(e) {
    if(e.key === 'Enter') {
      goSearch();
    }
  }

  async function goSearch() {
    keyword.current = inputKeyword;
    page.current = 2;
    document.querySelector('#scrollEnd').hidden = false;
    resetMeetups();
  }

  async function resetMeetups() {
    setCheckedMine(false);

    let arr = [];
    for (let i = 1; i < page.current; i++) {
      // console.log(`page: ${i}, keyword: ${keyword.current}`);
      const { data } = await apiAxios.get(`/api/meetups?p=${i}&keyword=${keyword.current}`);
      arr = [...arr, ...data];
    }
    setMeetups(arr);
  }

  function getMeetups(p, k) {
    setLoading(true);
    // console.log(`page: ${p}, keyword: ${k}`);
    apiAxios
      .get(`/api/meetups?p=${p}&keyword=${keyword.current}`)
      .then(({ status, data }) => {
        if (status === 200) {
          const newMeetups = data;
          if (newMeetups.length === 0) {
            console.log('더 불러올 데이터가 없습니다.');
            document.querySelector('#scrollEnd').hidden = true;
          } else {
            setMeetups((prev) => [...prev, ...newMeetups]);
          }
        }
      }).catch((e) => {
        console.log('axios 통신실패');
        console.log(e);
      }).finally(() => {
        setLoading(false);
      })
  }

  function getMeetupDetail(meetupId) {
    apiAxios
      .get(`/api/meetups/${meetupId}`)
      .then((response) => {
        if (response.status === 200) {
          const meetup = response.data;
          dispatch(setMeetup(meetup));
          dispatch(setModalName('detail'));
          dispatch(setShow(true));
        }
      })
      .catch((e) => {
        console.log('axios 통신실패');
        console.log(e);
      });
  }

  function showModal(modalName) {
    dispatch(setModalName(modalName));
    dispatch(setShow(true));
  }
}

export default MeetupsList;
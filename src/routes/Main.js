import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  let navigate = useNavigate();

  return (
    <>
      <Button variant="primary" onClick={()=>{navigate('/sample')}}>샘플페이지</Button>
      <Button variant="primary" onClick={()=>{navigate('/meetups')}}>모임</Button>
    </>
  )
};

export default Main;

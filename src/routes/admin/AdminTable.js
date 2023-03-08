import { Table } from "react-bootstrap";

const AdminTable = ({ header, data, original, width, done, TableButtons }) => {
  if (!header || !data) {
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {header.map((head, index) => (
            <th key={index} style={{ width: `${width[index]}%` }}>
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((slice, order) => (
          <tr key={order}>
            {slice.map((value, index) => (
              <td key={index}>{value}</td>
            ))}
            <td key={header.length - 1}>
              {TableButtons
                ? TableButtons.map((TableButton) => (
                    <TableButton
                      id={slice[0]}
                      order={order}
                      entity={original[order]}
                      done={done}
                    />
                  ))
                : ""}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AdminTable;

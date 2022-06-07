import React from "react";


const TableWrapper = (props) => {
  console.log(props,'PROPS');
  const tables = [];
  let tablesCount = -1;


  return (
    <div className="DraftailTables-TableWrapper">
      {tables.map((rows, i) => (
        <div key={i} className="DraftailTables-TableWrapper__table">
          {rows.map((row, j) => (
            <div key={row[0].key} className="DraftailTables-TableWrapper__tr">
              {row.map((cell, s) => (
                <div key={cell.key} className="DraftailTables-TableWrapper__td">
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableWrapper;
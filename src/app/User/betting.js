/*
exports.indexTestQuery = async function(connection) {
    const query = `
    select *
    from test;
    `

    const [array] = await connection.query(query);
    return array;

}*/

exports.makeBettingField = async function (params, connection) {
  const sql = `
        insert into 
            PredictBoard(creator,title,content,minimumPoint,deadline) 
            values (?,?,?,?,?);
    `;

  const resultRow = await connection.query(sql, params);

  return resultRow;
};

exports.insertChoice = async function (connection, fieldID, index, value) {
  const sql = `
        insert into 
            choice(boardID, choiceNum, message, status) 
            values (?,?,?,?);
    `;

  const resultRow = await connection.query(sql, [fieldID, index, value, index]);

  return resultRow;
};

exports.getBettingInfo = async function (connection) {
  const sql = `
  SELECT P.boardID, U.nickName, P.title, P.content, P.createdAt, P.deadLine,  U.profileImage
  FROM PredictBoard P
  INNER JOIN User U on P.creator = U.userID
  WHERE P.status='A' AND P.deadLine > NOW()
  ORDER BY createdAt DESC
  LIMIT 0, 5;                                                  
    `;

  const result = await connection.query(sql);

  return result[0];
};

exports.getBettingField = async function (connection, boardID) {
  const sql = `
    SELECT P.boardID, U.nickName, P.title, P.content, P.createdAt, P.deadLine,  U.profileImage
    FROM PredictBoard P
    INNER JOIN User U on P.creator = U.userID
    WHERE P.status='A' AND P.deadLine > NOW() AND P.boardID=?
    ORDER BY createdAt DESC
    LIMIT 0, 5;                                                  
      `;

  const result = await connection.query(sql, boardID);

  return result[0];
};

exports.checkExistBoardID = async function (connection, boardId) {
  const sql = `
    select boardID,creator,title,content,minimumPoint,deadLine 
      from PredictBoard 
    where boardID = ?;
  `;

  const [resultRow] = await connection.query(sql, boardId);

  return resultRow;
};

exports.getChoiceInfo = async function (connection, boardId) {
  const sql = `
    select choiceID,choiceNum,message 
      from choice 
    where boardID = 29;
  `;

  const [resultRow] = await connection.query(sql, boardId);

  return resultRow;
};

exports.insertBettingInfo = async function (
  connection,
  choiceID,
  boardId,
  userId,
  pointAmount,
  choiceNum
) {
  const sql = `
  insert into BetField(choiceID, boardID, userID, betPoint, status) values (?,?,?,?,?);
  `;

  const [resultRow] = await connection.query(sql, [
    choiceID,
    boardId,
    userId,
    pointAmount,
    choiceNum,
  ]);

  return resultRow;
};

exports.checkAlreadyBet = async function (connection, userId) {
  const sql = `
  select * 
    from BetField 
  where userID = ?;
  `;

  const [resultRow] = await connection.query(sql, userId);

  return resultRow;
};

exports.checkUserInfo = async function (connection, userId) {
  const sql = `
    select userID, nickName, ID, email, point, profileImage, birth 
      from User 
    where userID = ?;
  `;

  const [resultRow] = await connection.query(sql, userId);

  return resultRow;
};

exports.updateUserPoint = async function(connection,userId,updatedPoint){
  const sql = `
  UPDATE User
  SET point = ?
  WHERE userID = ?;
  `;

  const [resultRow] = await connection.query(sql,[updatedPoint,userId]);

  return resultRow;


}

exports.getBettingChoice = async function (connection, boardID) {
  const sql = `
    SELECT C.message
    FROM choice C
    INNER JOIN PredictBoard P on C.boardID = P.boardID
    WHERE C.boardID=?;                                                  
      `;

  const result = await connection.query(sql, boardID);

  return result[0];
};

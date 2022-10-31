module.exports = {

    SUCCESS : function successSet (message) {
        return {"isSuccess" : true, "code" : 0, "message" : message}
    },

    FAIL : {"isSuccess" : false, "code" : -1 , "message" : "실패입니다."},
    NOT_USER : {"isSuccess" : false, "code" : -1 , "message" : "회원가입 후에 베팅 등록을 하실 수 있습니다."},
    EMPTY_TITLE : {"isSuccess" : false, "code" : -1 , "message" : "제목을 입력해주세요"},
    EMPTY_CONTENTS : {"isSuccess" : false, "code" : -1 , "message" : "내용을 입력해주세요"},
    EMPTY_DEADLINE : {"isSuccess" : false, "code" : -1 , "message" : "마감일을 설정해주세요"},
    INSERT_CHOICE : {"isSuccess" : false, "code" : -1 , "message" : "선택지를 올바르게 입력해주세요. 선택지는 2개 이상, 5개까지만 만들수 있습니다. "},
    ERROR_MAKE_FIELD : {"isSuccess" : false, "code" : -1 , "message" : "베팅장을 만드는 데 오류가 발생했습니다."},
    ERROR_MAKE_CHOICE: {"isSuccess" : false, "code" : -1 , "message" : "선택지를 만드는 데 오류가 발생했습니다."},
    WRONG_DEADLINE: {"isSuccess" : false, "code" : -1 , "message" : "지난 날짜는 마감일로 설정할 수 없습니다"},
    EMPTY_CHOICE_NUMBER: {"isSuccess" : false, "code" : -1 , "message" : "선택지를 올바르게 선택해주세요"},
    WRONG_POINT_INPUT: {"isSuccess" : false, "code" : -1 , "message" : "베팅할 포인트를 올바르게 입력해주세요."},
    LESS_THEN_MINIMUM_POINT: {"isSuccess" : false, "code" : -1 , "message" : "베팅장에 설정된 최소 베팅 금액이상의 포인트를 베팅해주세요."},
    EMPTY_BOARD: {"isSuccess" : false, "code" : -1 , "message" : "베팅장 정보가 없습니다."},
    ALREADY_BET: {"isSuccess" : false, "code" : -1 , "message" : "이미 베팅하셨습니다. 한번 베팅하신 베팅장에는 베팅할 수 없습니다."},
    WRONG_USER_INFO: {"isSuccess" : false, "code" : -1 , "message" : "유저 정보가 존재하지 않습니다."},
    ERROR_POINT_UPDATED: {"isSuccess" : false, "code" : -1 , "message" : "포인트 업데이트에 실패했습니다."},


};

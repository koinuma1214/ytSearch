/*
 * 閉じるボタンを押したときの処理
 */
function selectData() {
    initiation();

    // チェックされている値を取得
    $('#resultTable tr').each(function (i, tr) {
        if ($(tr).find('input:radio').size()>0){
            if ($(tr).find('input:radio').is(':checked')){
                if ($('#selectValue').val() == '') {
                    $('#selectValue').val($(tr).find('input:radio').val())
                } else {
                    $('#selectValue').val("," + $(tr).find('input:radio').val())
                }
            }
        }
    });

    // クローズ処理
    if ($('#selectValue').val() == '') {
        setAlert("選択されていません");
    } else {
        window.opener.onCallBack($('#selectValue').val());
        window.close();
    }
}

function selectDataTest() {
    $('#selectValue').val('aaa');
    window.opener.onCallBack($('#selectValue').val());
    window.close();
}

/*
 * 初期化処理
 */
function initiation() {
    $('#selectValue').val("");
    setAlert("");
}

/*
 * エラー時警告文字を設定
 */
function setAlert(text) {
    $('#alertLabel1').text(text);
    $('#alertLabel2').text(text);
}

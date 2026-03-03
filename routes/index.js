/*
 * 利用関数の宣言
 */
// 各種変数
var express = require('express');
var router = express.Router();

var condition = {
  maxResults:50,
  qtext:'',
  order : 'relevance'
}
var searchCondition = {
  maxResults:50,
  part:['id','snippet']
}
var result = null
var titleText = 'Youtube 動画検索'
var descriptionText = 'Youtubeの動画を検索できるツールです。<br>日付指定、チャンネル指定、新しい順などで検索できます。<br>'

// youtube系の変数
const {google} = require("googleapis");
const youtube = google.youtube({
    version: "v3",
    auth: 'AIzaSyDQ84RTme-2MNnqHa4hXsWiSXuS5Oo9zj0',
});

/*
 * GET home page.
 */
router.get('/', function(req, res, next) {
  /*
   * レンダリング処理
   */
  res.render('index',
    { 
      title: titleText,
      description: descriptionText,
      condition: condition,
      result : null
     });
});

/*
 * 検索ボタンクリック
 */
router.post('/', function(req, res, next) {
  /*
   * 入力された検索条件の取得
   */
  let inputData = req.body
  if(inputData.channelId != '') {
    searchCondition.channelId = new String(inputData.channelId).split(",")
  }

  searchCondition.order = inputData.order;

  if(inputData.startDate != '') {
    searchCondition.publishedAfter = new Date(inputData.startDate).toISOString();
  }

  if(inputData.endDate != '') {
    searchCondition.publishedBefore = new Date(inputData.endDate).toISOString();
  }

  if (inputData.qtext != '') {
    searchCondition.q = [inputData.qtext];
  }

  /*
   * 検索処理
   */
  (async () => {
    var seachResult = null;
    var searchEnd = false;
    var nextPageToken = '';
    var iMax = 100;
    var i = 0;
    do {
      // 関数の宣言
      var tempSeachResult = null;
      var tempMaxResults = 0;

      if(seachResult === null)  {
        // 初回検索処理
        if(inputData.maxResults >= 50) {
          tempMaxResults = 50;
        } else {
          tempMaxResults = inputData.maxResults;
        }

        searchCondition.maxResults = tempMaxResults;

        tempSeachResult = await youtube.search.list({
          ...searchCondition,
          type : 'video',
        });
        seachResult = tempSeachResult;

      } else {
        // 2回目以降の検索
        tempMaxResults = inputData.maxResults - seachResult.data.items.length;
        if(tempMaxResults >= 50) {
          tempMaxResults = 50;
        }
        searchCondition.maxResults = tempMaxResults;

        tempSeachResult = await youtube.search.list({
          ...searchCondition,
          pageToken: nextPageToken,
          type : 'video',
        });
        seachResult.data.items = seachResult.data.items.concat(tempSeachResult.data.items);
      }

      // 検索後処理
      nextPageToken = tempSeachResult.data.nextPageToken;     
      if(tempSeachResult.data.pageInfo.totalResults === 0 || 
          tempSeachResult.data.nextPageToken === "" ||
          seachResult.data.items.length >= inputData.maxResults ||
          i > iMax) {
        searchEnd = true;
      }
      i++;
    } while(searchEnd === false)

    // 描画処理
    res.render('index',
      {
        title: titleText,
        description: descriptionText,
        condition: inputData,
        result :seachResult
    });
  })();
});

module.exports = router;
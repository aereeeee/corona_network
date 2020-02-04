let status = "net";

$(".menu-filter").click(function() {
  if (status === "filter") return;
  status = "filter";

  $("#menu-title").html("신종 코로나 확진자 조회");
  $("#btnbox").css("display", "none");
  $(".articletext").css("display", "none");
  $(".rangeslider").css("display", "none");
  $("#slider").css("display", "none");

  $(".filter").css("display", "block");

  $("#datatablTitle").html("환자 클릭");
});

$(".menu-net").click(function() {
  if (status === "net") return;
  status = "net";

  $("#menu-title").html("신종 코로나 감염자<br />한눈에 보기");
  $("#btnbox").css("display", "block");
  $(".articletext").css("display", "block");
  $(".rangeslider").css("display", "block");
  $(".filter").css("display", "none");
  $("#slider").css("display", "block");

  $("#datatablTitle").html("인물 혹은 연결선을 클릭하세요");
});

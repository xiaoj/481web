window.onload = function() {
  $("#assist-menu li").click(function() {
    var name = this.id;
    $("#assist-display").children().hide();
    $("#assist-display").children("#" + name).show();
    $("#assist-display").children("#" + name).find("*").show();
  });
  $("#converter-pounds").keyup(function() {
    var pounds = $("#converter-pounds").val();
    $("#converter-kilos").val(pounds * .453592);
  });
  $("#converter-kilos").keyup(function() {
    e.unbind();
    var kilos = $("#converter-kilos").val();
    $("#converter-pounds").val(kilos * 2.20462);
  });
  $("#convert-submit").click(function(e) {
    e.preventDefault();
    $("#convert-result").text(pounds + " pounds is " + (pounds * .453592) + " Kg");
  });
}



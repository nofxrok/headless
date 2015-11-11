$( document ).ready(function() {

    var tocfile;
    if ($(" #sidebar-wrapper.reference").length) {
        tocfile = '/help/themes/bootstrap/js/ref-toc.html';

    }
    else tocfile = '/help/themes/bootstrap/js/user-toc.html';

    $("#sidebar-wrapper").load(tocfile, function (response, status, xhr) {


        $("a[href='" + window.location.pathname + "']").last().replaceWith('<div id="toc"></div>');
        $("#toc").parents("li").removeClass('collapsed').addClass('active');

        insertBreadcrumb();
        var wheight = $( window ).height() - 300;
        $(function(){
            $(".sidebar-nav").slimScroll({
                width: 'inherit',
                height: wheight
            });
        });
        if ($("#accordion").size()) {
            // special handling for help center

            $(".panel-title a").append('<i class="glyphicon glyphicon-chevron-right"></i>');
            $(".panel-title a").on("click", function() {
                //window.location.hash = this.hash;
            });

            $('.panel-collapse').on('hidden.bs.collapse', function () {
                //console.log(this.id);
                var icon = this.previousElementSibling.getElementsByTagName("i");
                $(icon).removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
            });
            $('.panel-collapse').on('show.bs.collapse', function () {
                //console.log(this.id);
                var icon = this.previousElementSibling.getElementsByTagName("i");
                $(icon).removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
            });
        }
        else $("#toc").hide().tocify({
            context: "#page-content-wrapper",
            scrollTo: 100,
            selectors: 'h1,h2,h3,h4,h5,h6'
        }).show(400).promise().done(function() {
            var scrollTo_val = $("#tocify-header0").offset().top - 400 + 'px';
            $(".sidebar-nav").slimScroll({ scrollTo : scrollTo_val });

        });

        $("#next-button, #next-link").click(function(e) {

            if ($('#toc').next('ul').length) {
                window.location.href = $('#toc').next('ul').first('li').find("a:first").attr("href");
            }

            else if ($('#toc').parent('li.active').next('li').length) {
                window.location.href = $('#toc').parent('li.active').next('li').find("a:first").attr("href");
            }
            else {
                var found = false;
                $('#toc').parents('li.active').each(function() {
                    if ($(this).next('li').length) {
                        window.location.href = $(this).next('li').find("a:first").attr("href");
                        found = true;
                        return false;
                    }
                });
                if (!found) {
                    $('#next-button').attr('title', 'Last topic reached.');
                }
            }
        });

        $("#search-form input").keypress(function(e) {

            if(e.which == 13) {
                window.location.href = '/help/search.html?zoom_query=' + encodeURIComponent($(this).val());
            }
        });


        $("li.collapsible.collapsed a").append('<i class="glyphicon glyphicon-chevron-right"></i>');
        $("li.collapsible.active a:first").append('<i class="glyphicon glyphicon-chevron-down"></i>');


    });



    $("img").each(function() {
        var source = $(this).attr("src");
        var id = $(this).attr("id");
        $(this).wrap('<a href="'+ source + '" data-lightbox="' + id + '"></a>' )
    });



    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });



    /*getting started*/
    $(".section.gs-real h2").append('&nbsp;<i class="glyphicon glyphicon-globe"></i>');
    $("p.gs-time").append('&nbsp;<i class="glyphicon glyphicon-time"></i>');
    $("p.gs-difficulty-1").append('&nbsp;<i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star-empty"></i><i class="glyphicon glyphicon-star-empty"></i><i class="glyphicon glyphicon-star-empty"></i><i class="glyphicon glyphicon-star-empty"></i>');
    $("p.gs-difficulty-2").append('&nbsp;<i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star-empty"></i><i class="glyphicon glyphicon-star-empty"></i><i class="glyphicon glyphicon-star-empty"></i>');
    $("p.gs-difficulty-3").append('&nbsp;<i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star-empty"></i><i class="glyphicon glyphicon-star-empty"></i>');
    $("p.gs-difficulty-4").append('&nbsp;<i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star-empty"></i>');
    $("p.gs-difficulty-5").append('&nbsp;<i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star"></i><i class="glyphicon glyphicon-star"></i>');




}); // $.document.ready

//refresh on window resize
var rtime = new Date(1, 1, 2000, 12,00,00);
var timeout = false;
var delta = 0;
$(window).resize(function() {
    rtime = new Date();
    if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
    }
});

function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;
        location.reload();
    }
}

function insertBreadcrumb() {
    $('.topictitle1').first().after(function() {

        var out;

        if ($('#next-button').length) out = '<span class="crumb rootcrumb">' + $('.topictitle1').text() + '</span><a href="#" id="next-link">Next</a></div>';
        else out = '<span class="crumb rootcrumb">' + $('.topictitle1').text() + '</span></div>';




        $('#toc').parent('li.active').parents('li.active').each(function() {
            out = '<span class="crumb"><a href="' + $(this).find("a:first").attr("href") + '">' + $(this).find("a:first").text() + '</a></span><i class="glyphicon glyphicon-chevron-right"></i>' + out;
        });

        out = '<div class="breadcrumbs"><span class="crumb"><a href="' + $('#guide-title a').attr("href") + '">'+ $('#guide-title a').text() + '</a></span><i class="glyphicon glyphicon-chevron-right"></i>' + out;

        return out;
    });
}
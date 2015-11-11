$( document ).ready(function() {


    var wheight = $( window ).height() - 160;
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
    }).show(400);

    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });

    $("#next-button").click(function(e) {
        window.location.href = $("li.no-child.active").next().find("a:first").attr("href");
    });

    $("li.collapsible.collapsed a").append('<i class="glyphicon glyphicon-chevron-right"></i>');
    $("li.collapsible.active a:first").append('<i class="glyphicon glyphicon-chevron-down"></i>');

    $(".iceburn").mouseenter(function() {
       $(this).find('img').removeClass("hidden");
    }).mouseleave(function() {
        $(this).find('img').addClass("hidden");
    });

    $("#hostname").on("click", function() {

        bootbox.dialog({
            title: "What's this about the Hostname?",
            message: '<p>Minions contact the master using the \'salt\' hostname. There are many ways to resolve this hostname, here are a couple:</p><ul><li>Set the master hostname to \'salt\' and use DNS</li><li>Add an entry to the system hosts file</li></ul> <p>If you\'d rather bypass the hostname entirely, you can specify the master address in the /etc/salt/minion config file directly. Whatever method you choose, the only requirement is that the minion has some way to find the master on the network.</p><p></p>',
            buttons: {
                success: {
                    label: "Got It!"
                    }
                }
        });
    });

    $("#install-video").on("click", function() {
        bootbox.dialog({
            title: "SaltStack Installation Demo",
            className: "modal90",
            message: '<video controls autoplay preload="auto" width="640"> <source src="video/installation.mp4" type="video/mp4" /><source src="video/installation.webm" type=\'video/webm;codecs="vp8, vorbis"\'/> <p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p> </video>',
            buttons: {
                success: {
                    label: "Close"
                }
            }
        });
    });

    $("#troubleshooting").on("click", function() {
        bootbox.dialog({
            title: "Troubleshooting",
            message: '<p>If the expected output isn\'t seen, the following tips can help to narrow down the problem.</p><h4>Turn up logging</h4><p>Salt can be quite chatty when you change the logging setting to debug:</p><pre class="pre codeblock language-bash">salt-minion -l debug</pre><h4>Run the minion in the foreground</h4><p>By not starting the minion in daemon mode (-d) one can view any output from the minion as it works:</p><pre class="pre codeblock language-bash">salt-minion &</pre><h4>Increase the default timeout</h4><p>Increase the default timeout value when running salt. For example, to change the default timeout to 60 seconds:</p><pre class="pre codeblock language-bash">salt -t 60</pre><p>For best results, combine all three:</p><pre class="pre codeblock language-bash">salt-minion -l debug & # On the minion</pre><pre class="pre codeblock language-bash">salt '*' state.highstate -t 60 # On the master</pre>',
            buttons: {
                success: {
                    label: "Got It!"
                }
            }
        });
    });
    
    /*getting started*/
/*    $(".section.gs-real h2").append('&nbsp;<i class="glyphicon glyphicon-globe"></i>');
    $(".section.gs-terms h2").append('&nbsp;<i class="glyphicon glyphicon-info-sign"></i>');*/
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
        //handle resize
        var wheight = $( window ).height() - 160;
        $(".sidebar-nav").slimScroll({
            width: 'inherit',
            height: wheight
        });
    }
}

function removeHash () {
    history.pushState("", document.title, window.location.pathname
    + window.location.search);
}
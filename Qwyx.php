<!doctype html>
<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/Include/globals.php';?>
<?php include_once $GL_root . $GL_path . '/Include/session.php';?>
<html lang="<?php echo $_SESSION['lang']; ?>">

<head>
    <?php include_once $GL_root . $GL_path . '/Include/head_includes.php';?>
    <title>QWYX</title>
    <link rel="canonical" href="https://www.c00lsch00l.eu/Games/Qwyx.php">
</head>

<body>
    <?php include_once $GL_root . $GL_path . '/Include/header.php';?>

    <div id="gameResolutionAlert" class="hide_extraLarge hide_large">
        <h3>Resolution too low alert!</h3>
        <p>You are trying to run this game on a device which has insufficient resolution to display the game properly.
            Just so you know ...</p>
    </div>
    <div id="preload" class="hidden"></div>

    <div class="container my-5 p-2 cool_page">
        <!-- CONTENT -->
        <div id="setup">
            <div id="load"></div>
            <div id="SC"></div>
            <h1 id="title" style='font-family: "Arcade"'></h1>
            <p>Capture at least 75% of the territory from the Qwyx, while avoiding Sparx and the Fuse. Remake of the
                legendary game from 1981.</p>
            <p id="buttons">
                <input type='button' id='toggleHelp' value='Show/Hide Instructions'>
                <input type='button' id='toggleAbout' value='About'>
            </p>
            <div id="help" class="section">
                <fieldset>
                    <legend>
                        Instructions:
                    </legend>
                    <p>Cursor key to move.</p>
                    <p>SHIFT - slow draw - double score</p>
                    <p>CTRL - fast draw</p>
                    <p>Split the two Qwyxes to increase bonus multiplier.</p>
                </fieldset>
            </div>
            <div id="about" class="section">
                <fieldset>
                    <legend>
                        About:
                    </legend>
                    <image src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8d/Qixingame.png/220px-Qixingame.png"
                        alt="Qix" class="border border-dark p-1 m-2 float-start" title="Qix">
                        <p> QWYX is a clone of <a href="https://en.wikipedia.org/wiki/Qix" target="_blank">Qix</a>,
                            released in 1981; developed by Randy and Sandy Pfeiffer.</p>
                        <p>This clone tries to remains faithful to the original with some slight modifications.</p>
                        <p>Algorithm for finding the point on which Flood fill is to be performed, described in <a
                                href="https://gamedev.stackexchange.com/a/184932/109513"
                                target="_blank">gamedev.stackexchange</a>.</p>

                </fieldset>
            </div>

            <p class="version cb" id="version"></p>
        </div>
        <!-- END CONTENT  -->
    </div>

    <div class="container">
        <div id="game" class="winTrans"></div>
        <div id="bottom" style="margin-top: 720px"></div>
        <div id="temp" class="hidden"></div>
        <div id="temp2" class="hidden"></div>
    </div>

    <?php include_once $GL_root . $GL_path . '/Include/footer.php';?>
    <script src="/JS/LIB/prototypeLIB_2_13.js" type="text/javascript"></script>
    <script src="/JS/LIB/score_1_04.js" type="text/javascript"></script>
    <script src="/JS/LIB/engine_2_51.js" type="text/javascript"></script>
    <script src="/JS/LIB/grid_2_00.js" type="text/javascript"></script>
    <script src="/Games/Assets/assets_Qwyx.js" type="text/javascript"></script>
    <script src="/Games/Qwyx.js" type="text/javascript"></script>
</body>

</html>
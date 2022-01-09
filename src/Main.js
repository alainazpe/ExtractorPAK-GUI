// dragover and dragenter events need to have 'preventDefault' called
// in order for the 'drop' event to register. 
// See: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Drag_operations#droptargets

dropContainer.ondragover = dropContainer.ondragenter = function(evt) {

    evt.preventDefault();
    $( "#dropContainer" ).removeClass('transparencia');
    $( "#dropContainer" ).addClass('mouse-over');

};

dropContainer.ondragleave = dropContainer.ondragleave = function(evt) {

    $( "#dropContainer" ).removeClass('mouse-over');
    

};

dropContainer.ondragend = dropContainer.ondragend = function(evt) {

    $( "#dropContainer" ).removeClass('mouse-over');

};

dropContainer.ondrop = function(evt) {
    // pretty simple -- but not for IE :(
    fileInput.files = evt.dataTransfer.files;
    evt.preventDefault();
};

{
    // dom

    $( ".archivosAdaptativo" ).hide()
    $( ".extrayendo" ).hide()
    $( "#fileInput" ).hide()
    
    window.checkExtraer = false
    domElementUpdate = function() {
        if (this.domElement == null)
        {
            var divSession = document.createElement("div");
 
            var divFileOperations = document.createElement("div");
              
            var inputFileToLoad = document.createElement("input");
            inputFileToLoad.type = "file";
            inputFileToLoad.id = "inputFileToLoad"
            inputFileToLoad.accept = ".PAK";
            inputFileToLoad.onchange = this.inputFileToLoad_Changed.bind(this);
            fileInput.onchange = this.inputFileToLoad_Changed.bind(this);
            divFileOperations.appendChild(inputFileToLoad);

 		    // Presionar boton explorar automaticamente $(inputFileToLoad).trigger("click");
            
            var buttonSave = document.createElement("button");
            buttonSave.innerHTML = "Extraer";
            buttonSave.onclick = this.buttonSave_Clicked.bind(this);

            var divMain = document.getElementById("divMain");
            divMain.appendChild(divSession);
 
            this.domElement = divSession;
            
            var btnExaminar = document.createElement("input");
            btnExaminar.type = "button";            
            btnExaminar.id = "Examinar";
            btnExaminar.value = "EXAMINAR";
            divSession.appendChild(btnExaminar);
            
            $( "#Examinar" ).click(function() {
                $(inputFileToLoad).trigger("click");
              });

            var btnAbrirCarpeta = document.createElement("input");
            btnAbrirCarpeta.type = "button"; 
            btnAbrirCarpeta.id = "AbrirCarpeta";
            btnAbrirCarpeta.value = "ABRIR CARPETA";
            divSession.appendChild(btnAbrirCarpeta);

            $( "#AbrirCarpeta" ).click(function() {

                window.rutaExtraido = window.rutaCarpetaPAKBackup + window.nombrePAKSinExtension + "\\";
                
                require('child_process').exec('start "" "' + window.rutaExtraido + '"');

                
              });

              
           $( "#AbrirCarpeta" ).hide()

        }
 
        return this.domElement;
    }
 
    // events

    
    buttonSave_Clicked = function()
    {}
     
    inputFileToLoad_Changed = function(event)
    {
        $(".info").hide();
        var inputFileToLoad = event.target;
        var fileToLoad = inputFileToLoad.files[0];

        window.rutaPAK = inputFileToLoad.files[0].path; // C:\pak\fichero00.pak
        window.nombrePAK = inputFileToLoad.files[0].name; // fichero00.pak
        window.nombrePAKSinExtension = window.nombrePAK.split(".")[0]; // fichero00
        window.rutaCarpetaPAK = window.rutaPAK.split(window.nombrePAK)[0]; // C:\pak\
        TituloVentana = window.nombrePAK + " - ExtraerPAK v1.1"

        document.title = TituloVentana
        require ("nw.gui").Window.get().title=TituloVentana;

        if (fileToLoad != null)
        {
            $( "#arrastra" ).hide()
            $( "#dropContainer" ).addClass('transparencia');
            $( ".extrayendo" ).show()
            $( "#AbrirCarpeta" ).show()
            var fileReader = new FileReader();
            fileReader.onload = this.inputFileToLoad_Changed_Loaded.bind(this); 
            fileReader.readAsBinaryString(fileToLoad);
            
        } 
    }
 
    /////////////////////
    inputFileToLoad_Changed_Loaded = function(fileLoadedEvent) 
    {
       
        this.domElementUpdate();
        this.buttonAdapt_Clicked();
        
    }
     
    buttonAdapt_Clicked = function()
    {               
        var spawn = require('child_process').spawn; 

        window.rutaElevacion = "datos\\elevate.exe /c /w ";
         
        var ua = navigator.userAgent.toLowerCase();
        var isWinXP = ua.indexOf('windows nt 5.1') > 0; 
        
        if(isWinXP){
            $( ".extrayendo" ).hide();
            window.rutaElevacion = '';
        }

        window.rutaPAKCLI = window.rutaElevacion + '"datos\\escribirFichero.cmd"';
       
        // Variable global JS           Valor que devuelve          Argumento en PowerShell

        // window.rutaPAK               C:\pak\fichero00.pak                         $args[0]
        // window.nombrePAK             fichero00.pak                                $args[1]
        // window.nombrePAKSinExtension fichero00                                    $args[2]
        // window.rutaCarpetaPAK        C:\pak\                                     $args[3]
       
        argumentos = `"` + window.rutaPAK + `" "` +  window.rutaCarpetaPAK + window.nombrePAKSinExtension + `"`;

        var child = spawn(window.rutaPAKCLI,  [argumentos], {
            detached: true,
            shell: true
        });

         // Compatibilidad espacios para argumentos en cmd (Windows XP)
        window.rutaCarpetaPAKBackup = window.rutaCarpetaPAK;
        window.rutaPAK = window.rutaPAK.replace(/ /g, '%20');
        window.rutaCarpetaPAK = window.rutaCarpetaPAK.replace(/ /g, '%20');
        
       
        child.on('error', function(error) {
            alert('error: %s', error);
        });

        leerFicheroCLI = function(msgAlerta) {

            const fs = require("fs");
           
            // __dirname means relative to script. Use "./data.txt" if you want it relative to execution path.
           
            fs.readFile("datos\\status.txt", (error, data) => {
           
                if(error) {
          
                    throw error;
           
                }
                datos = data.toString();

                dioError = datos.split("ERROR").slice(1);

                if (dioError != ""){
                    alert("/!\\ ERROR" + dioError + "\n Lea el log para más detalles");
                } 

                datos = datos.replace(/\n/g, '<p>');

                if (msgAlerta != ""){
                    window.infoTXT = msgAlerta + "<br/>" + datos;
                } else {
                    window.infoTXT = datos;
                }

                window.htmlTexto = window.infoTXT + '</div></font></html>';
                          
                elhtml = '<html><div id="flotante"><div id="tituloFlotante"><h2><img class="directorio" src="svg/folder.svg"></img>' + window.nombrePAK + '</h2><br/></div>' + window.htmlTexto;
        
                $( ".archivos" ).empty();
                $( ".archivos" ).append( $(elhtml) );


            });

        };

        child.on('exit', function (code) { 
            
            dropContainer.ondragleave = dropContainer.ondragleave = function(evt) {

                $( "#dropContainer" ).removeClass('mouse-over');
                $( "#dropContainer" ).addClass('transparencia');
                $( "#arrastra" ).hide()
            };

            $( ".extrayendo" ).hide()
            $( "#arrastra" ).show()
             
            if (code == 0){leerFicheroCLI("");}
            if (code == 1){leerFicheroCLI("Error en la parafernalia de extracción.");}
            if (code == 2){leerFicheroCLI("Ha ocurrido un problema ERROR 2.")}
            if (code == 3){leerFicheroCLI("Ha ocurrido un problema ERROR 3.");}
            if (code == 4){leerFicheroCLI("Ha ocurrido un problema ERROR 4.");}
                        
        });
    }
}

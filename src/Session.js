function Session(bytes)
{
    this.bytes = bytes;
    this.finalNibble = "";
}

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
    Session.prototype.domElementUpdate = function() {
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

                window.rutaExtraido = window.rutaCarpetaPAKBackup + "\\" + window.nombrePAKSinExtension + "\\";
                
                require('child_process').exec('start "" "' + window.rutaExtraido + '"');

                
              });

              
           $( "#AbrirCarpeta" ).hide()

            var textareaHexadecimal = document.createElement("textarea");
            textareaHexadecimal.id = "txtHex";
            textareaHexadecimal.cols = 1;
            textareaHexadecimal.rows = 1;
            textareaHexadecimal.onkeyup = this.textareaHexadecimal_KeyUp.bind(this);
            textareaHexadecimal.oninput = this.textareaHexadecimal_Changed.bind(this);
            this.textareaHexadecimal = textareaHexadecimal;
            divSession.appendChild(textareaHexadecimal);
 
            var textareaASCII = document.createElement("textarea");
            textareaASCII.cols = 1;
            textareaASCII.id = "txtASCII";
            textareaASCII.rows = 1;
            textareaASCII.disabled = true;
            this.textareaASCII = textareaASCII;
            divSession.appendChild(textareaASCII);
 
        this.textareaHexadecimal.style.visibility = "hidden";
        this.textareaASCII.style.visibility = "hidden";

        }
 
        var bytesAsStringHexadecimal = Converter.bytesToStringHexadecimal
        (
            this.bytes
        );
        this.textareaHexadecimal.value = 
            bytesAsStringHexadecimal + this.finalNibble;
 
        var bytesAsStringASCII = Converter.bytesToStringASCII
        (
            this.bytes
        );

        this.textareaASCII.value = bytesAsStringASCII

        return this.domElement;
    }
 
    // events

    
    Session.prototype.buttonSave_Clicked = function()
    {}
     
    Session.prototype.inputFileToLoad_Changed = function(event)
    {
        $(".info").hide();
        var inputFileToLoad = event.target;
        var fileToLoad = inputFileToLoad.files[0];

        window.rutaPAK = inputFileToLoad.files[0].path; // C:\pak\varios00.pak
        window.nombrePAK = inputFileToLoad.files[0].name; // varios00.pak
        window.nombrePAKSinExtension = window.nombrePAK.split(".")[0]; // varios00
        window.rutaCarpetaPAK = window.rutaPAK.split(window.nombrePAK)[0]; // C:\pak\
        window.rutaCarpetaPAK = window.rutaCarpetaPAK.substring(0,window.rutaCarpetaPAK.length - 1) // C:\pak
        TituloVentana = window.nombrePAK + " - ExtraerPAK v1.0"

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
    Session.prototype.inputFileToLoad_Changed_Loaded = function(fileLoadedEvent) 
    {
        
        var dataAsBinaryString = fileLoadedEvent.target.result;
 
        this.bytes = [];
 
        for (var i = 0; i < dataAsBinaryString.length; i++)
        {
            var byte = dataAsBinaryString.charCodeAt(i);
            this.bytes.push(byte);
        }
 
        this.domElementUpdate();
        
        this.buttonAdapt_Clicked();
        
    }
 
    
    Session.prototype.buttonAdapt_Clicked = function()
    {
        
        //Cargamos valor!!!
        var valor = this.textareaHexadecimal.value; //Dame el archivo PAK en forma hexadecimal

        //Comprobamos si es un PAK válido
        comprobacionA  = valor.substring(0,6);
        comprobacionB  = valor.substring(10,12);

        if ( comprobacionA == "50414b" && comprobacionB == "03")  { 
        } else {
            alert("Este fichero no es un .PAK compatible.");
            window.close();
            throw new Error("Este fichero no es un .PAK compatible.");
        }

        valor  = valor.substring(12,99999999999); //Quitame cabecera extensión PAK, y enseña la lista archivos + archivos en sí
        valor = valor.split("789c")[0]; //Dejame sin los archivos en sí (a partir de "xoe"), solo quiero la lista   

        //Trabajamos sobre la lista de archivos

        enBucle = false;

        numPuntos = parseInt(valor.substring(0,2), 16); 
        numFicheros = numPuntos;
        valor  = valor.substring(2,99999999999);
        
        while (numPuntos > 0)  {
            if (enBucle == true){
                sinEncontradoPrevio = valor.substring(encontrado.length + 10, 99999999999)  
                encontradoPrevio = valor.substring(0,encontrado.length + 10)  

                longitudHEX = parseInt(sinEncontradoPrevio.substring(0,2), 16);
                longitudFileName = 2 * longitudHEX;

                sinEncontradoPrevio = sinEncontradoPrevio.substring (2,999999999);

                encontrado = (encontradoPrevio + sinEncontradoPrevio.substring(0, longitudFileName));
                
                valor = encontrado + "3c62722f3e" + sinEncontradoPrevio.substring((longitudFileName+16),99999999999);

            } else { 
                longitudHEX = parseInt(valor.substring(0,2), 16);
                longitudFileName = 2 * longitudHEX;
                valor = valor.substring (2,999999999);

                encontrado = valor.substring(0, longitudFileName);

                encontradoPrevio = encontrado + "3c62722f3e" 

                valor = encontradoPrevio + valor.substring((longitudFileName+16),99999999999);
                
                enBucle = true;
            }

            //alert("numPuntos es " + numPuntos + ", baja uno")
            numPuntos--;
        } 
    
        this.textareaHexadecimal.value = valor;
        
        this.bytes = Converter.stringHexadecimalToBytes
        (
            valor
        );

        this.textareaASCII.value = Converter.bytesToStringASCII
        (
            this.bytes
        );

        valor = this.textareaASCII.value;

        elhtmlAdaptativo = "<html>" + valor + "</html>";

        if (numFicheros == 1) {numFicherosPlural = ""} else {numFicherosPlural = "s"}

        elhtml = '<html><div id="flotante"><font face="Verdana"><h2><img class="directorio" src="svg/folder.svg"></img>' + window.nombrePAK + "</h2><br/>Contiene " + numFicheros + " archivo" + numFicherosPlural + ': </div><div style="height:80px;"> </div><div class="listado">' + valor + '</div><div style="height:50px;"> </div></font></html>';

        $( ".archivos" ).empty();
        $( ".archivos" ).append( $(elhtml) );

        $( ".archivosAdaptativo" ).empty();
        $( ".archivosAdaptativo" ).append( $(elhtmlAdaptativo) );

        // Fin procesado JS, pasamos los parametros al script Powershell

        var path = require('path');
        var nwPath = process.execPath;
        
        var rutaPS1 = path.dirname(nwPath) + "\\datos\\ExtraeRenombraPAK.ps1";
        
        var spawn = require('child_process').spawn; 

        var ua = navigator.userAgent.toLowerCase();
        var isWinXP = ua.indexOf('windows nt 5.1') > 0; 
        
        if(isWinXP){
            $( ".extrayendo" ).hide()
        }

        window.rutaExtractorHEX = path.dirname(nwPath) + "\\datos\\offzip.exe";
        window.rutaListaFicheros = path.dirname(nwPath) + "\\datos\\lista.tmp";

        if (numPuntos == 0){
            
            var fs = require('fs');
            var stream = fs.createWriteStream(window.rutaListaFicheros);
            stream.once('open', function(fd) {
                caracteresFileName = sinEncontradoPrevio.indexOf('2e')+8;
                $('.archivosAdaptativo').find('br').replaceWith('\n')
                stream.write(
                    $('.archivosAdaptativo').text()
                )
                stream.end();
            });
        
        }

        // Variable global JS           Valor que devuelve          Argumento en PowerShell

        // window.rutaPAK               C:\pak\varios00.pak         $args[0]
        // window.nombrePAK             varios00.pak                $args[1]
        // window.nombrePAKSinExtension varios00                    $args[2]
        // window.rutaCarpetaPAK        C:\pak\                     $args[3]
        // window.rutaListaFicheros     ???/datos/lista.tmp            $args[4]
        // window.rutaExtractorHEX      ???/datos/offzip.exe           $args[5]

        // Compatibilidad espacios para argumentos en cmd (Windows XP)
        
        window.rutaCarpetaPAKBackup = window.rutaCarpetaPAK;
        window.rutaPAK = window.rutaPAK.replace(/ /g, '%20');
        window.rutaCarpetaPAK = window.rutaCarpetaPAK.replace(/ /g, '%20');
        window.rutaListaFicheros = window.rutaListaFicheros.replace(/ /g, '%20');
        window.rutaExtractorHEX = window.rutaExtractorHEX.replace(/ /g, '%20');

        // Abrimos cmd, abre powershell, lanza el script con los argumentos previos:
        // powershell.exe -NoExit -File -windowstyle hidden 
        window.powershellInfo = (`'powershell.exe` + ` -ExecutionPolicy Bypass -windowstyle hidden -File '` + rutaPS1 + `' '` + 
        window.rutaPAK + `' '` + window.nombrePAK + `' '` + window.nombrePAKSinExtension + `' '` +
        window.rutaCarpetaPAK + `' '` + window.rutaListaFicheros + `' '` +
        window.rutaExtractorHEX + `''` );
        
        window.powershellInfo = window.powershellInfo.replace(/'/g, '"');
        
        var child = spawn("cmd.exe",  ['/c', window.powershellInfo], {
            detached: true,
            shell: true
        });
        
        child.on('error', function(error) {
            alert('error: %s', error);
        });

        child.on('exit', function (code) { 
            
            dropContainer.ondragleave = dropContainer.ondragleave = function(evt) {

                $( "#dropContainer" ).removeClass('mouse-over');
                $( "#dropContainer" ).addClass('transparencia');
                $( "#arrastra" ).hide()
            };

            $( ".extrayendo" ).hide()
            $( "#arrastra" ).show()

            if (code == 0){alert("Fichero extraido correctamente.")}
            if (code == 1){alert("Error en la parafernalia de PowerShell.")}
            if (code == 2){alert("Ha ocurrido un problema al renombrar los archivos.")}
            if (code == 3){alert("Error: Faltan argumentos de extraccion.")}
            if (code == 4){alert("Contenido no extraido: El directorio " + window.nombrePAK + " ya existe.")}
            
        });
    }

    Session.prototype.textareaHexadecimal_Changed = function(event)
    {
      
        var bytesAsStringHexadecimal = event.target.value;
        this.bytes = Converter.stringHexadecimalToBytes
        (
            bytesAsStringHexadecimal
        );
 
        if (bytesAsStringHexadecimal.length % 2 == 0)
        {
            this.finalNibble = "";
        }
        else
        {
            this.finalNibble = bytesAsStringHexadecimal.substr
            (
                bytesAsStringHexadecimal.length - 1,
                1
            );
 
            var finalNibbleAsInt = parseInt(this.finalNibble, 16);
            if (isNaN(finalNibbleAsInt) == true)
            {
                this.finalNibble = "";
            }
        }
 
       this.domElementUpdate();
    }


 
    Session.prototype.textareaHexadecimal_KeyUp = function(event)
    {
        
        if (event.key.startsWith("Arrow") == true)
        {
            this.domElementUpdate();
        }
    }
 
    
  
}

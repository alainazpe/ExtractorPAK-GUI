$ErrorActionPreference = 'SilentlyContinue'

# Si es nulo args0+1+2+3+4+5, es decir, si fuese cmd serían $1 $2 $3 $4 $5 $6
if(!$args[0]) {write-host "`nDebes meter los seis argumentos (Véase este código).`nPuedes solucionar esto usando la utilidad con interfaz gráfica."
exit 3} 
$args[0] = $args[0] -replace "\%20", ' ' 
$args[3] = $args[3] -replace "\%20", ' ' 
$args[4] = $args[4] -replace "\%20", ' ' 
$args[5] = $args[5] -replace "\%20", ' ' 

$args[0]
$args[3]
$args[4]
$args[5]

        # Variable global JS           Valor que devuelve          Argumento en PowerShell

        # window.rutaPAK               C:\pak\varios00.pak         $args[0]
        # window.nombrePAK             varios00.pak                $args[1]
        # window.nombrePAKSinExtension varios00                    $args[2]
        # window.rutaCarpetaPAK        C:\pak\                     $args[3]
        # window.rutaListaFicheros     ???/datos/lista.tmp            $args[4]
        # window.rutaExtractorHEX      ???/datos/offzip.exe           $args[5]

$host.ui.RawUI.WindowTitle = $args[1] + " - ExtraeRenombraPAK v1.0"

write-host ("`nSe pone en cola el archivo: " + $args[1] + "`n")

# Unimos la variable ruta del PAK con su nombre ("C:\pak\varios00")
$rutaExtraer = ($args[3] + "\" + $args[2])

if(Test-Path $rutaExtraer){
    write-host "Contenido no extraido: El directorio " + $args[1] + " ya existe.";
    exit 4
} else {
    # Crea la carpeta C:\pak\varios00\
    new-item $rutaExtraer -itemtype directory | Out-Null
}
# Extracción deflate con nombres de regiones hex 
# offzip -a -z -15 -Q input.dat c:\output
write-host ("`nEXTRAYENDO " +  $args[1] + ", POR FAVOR, ESPERE...")
$argumentList = ("-a"),("-o"),("-z"),("15"),("-m"),("1"),("-q"),('"' + $args[0] + '"' ),('"' + $rutaExtraer + '"')

Start-Process $args[5] $argumentList -NoNewWindow -wait

write-host "`n`nExtraccion completada.`n"
# Parte de sistema de renombrado

# Archivos a renombrar (todo lo que haya en el directorio)
$filestochange = Get-ChildItem -Path $rutaExtraer

# Carga la lista generada
$FileNames = Get-Content -Encoding UTF8 $args[4]

# Variable para saber que el PAK solo contiene un archivo, al principio es 0 
$UnoEnLaLista = "0"

# Si es nulo filestochange.count: el PAK solo contiene un archivo
if(!$filestochange.Count) {$UnoEnLaLista = "1"} 

# Si es nulo filenames.count: el PAK solo contiene un archivo
if(!$FileNames.Count) {$UnoEnLaLista = "1"} 

# Si las dos variables dicen que solo hay un archivo: el PAK solo contiene un archivo
if ($filestochange.Count -eq 1 -and $FileNames.Count -eq 1) {$UnoEnLaLista = "1"} 

# Si solo hay que extraer un archivo
if ($UnoEnLaLista -eq "1")
	{
	write-host "Renombra $($filestochange) a $($FileNames)"
        Rename-Item -Path ($rutaExtraer + "\" + $filestochange) -NewName $($FileNames)
        exit 0
	}

if($filestochange.Count -eq $FileNames.Count)
{
    for($i=0; $i -lt $FileNames.Count; $i++)
    {
        write-host "Renombra $($filestochange[$i]) a $($FileNames[$i])"
        Rename-Item -Path ($rutaExtraer + "\" + $filestochange[$i]) -NewName $($FileNames[$i])
    }
} else {
    write-host "Problemas al renombrar los archivos."
    exit 2
}

exit 0
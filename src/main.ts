import * as SPLAT from "gsplat";

const scene = new SPLAT.Scene();
const renderer = new SPLAT.WebGLRenderer();
const camera = new SPLAT.Camera();
const controls = new SPLAT.OrbitControls(camera, renderer.domElement);

const inputFileElem = document.getElementById("input_file");
const inputUrlElem = document.getElementById("input_url");
const submitUrlElem = document.getElementById("submit_url");

let progressElem = document.getElementById("progress_bar");
let loadingElem = document.getElementById("loading_bar");

// document.getElementById("input_file").style.opacity = '0';

function updateProgress(progress : number) : void {
    if(progress <= 0.1)
        (loadingElem as HTMLElement).style.opacity = "1";

    (progressElem as HTMLProgressElement).value = 100 * progress;
}

function loadFromFile(file : File) : void {
    const ext = file.name.slice(-5);
    let promise : any;

    if(ext.slice(2) == "ply") {
        promise = SPLAT.PLYLoader.LoadFromFileAsync(file, scene, updateProgress);
        console.log(".ply file loaded");
        
    } else if(ext == "splat") {
        promise = SPLAT.Loader.LoadFromFileAsync(file, scene, updateProgress);
        console.log(".splat file loaded");
    
    } else {
        console.log("input file is neither has .ply or .splat extension.")
        
    }
    
    if(promise) {
        promise.then(() => {(loadingElem as HTMLElement).style.opacity = "0";} );
    }

}

function loadFromUrl(url : string) : void {
    const ext = url.slice(-5); 
    let promise : any;

    if(ext.slice(2) == "ply") {
        promise = SPLAT.PLYLoader.LoadAsync(url, scene, updateProgress);
        console.log(".ply file loaded");
        
    } else if(ext == "splat") {
        promise = SPLAT.Loader.LoadAsync(url, scene, updateProgress);
        console.log(".splat file loaded");
    
    } else {
        console.log("input file is neither has .ply or .splat extension.")
    }  

    if(promise) {
        promise.then(() => {(loadingElem as HTMLElement).style.opacity = "0";} );
    }
}

async function main() {
    const base_file_url = "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/kitchen/kitchen-7k.splat";
    await SPLAT.Loader.LoadAsync(base_file_url, scene, updateProgress)
    .then(() => {(loadingElem as HTMLElement).style.opacity = "0";} );

    inputFileElem?.addEventListener("change", handleFiles, false);
    submitUrlElem?.addEventListener("click", handleUrl, false);
    
    function handleFiles(event: Event) {
        const input = event.target as HTMLInputElement;

        if(input.files && input.files.length) {
            const file = input.files[0];
            loadFromFile(file);
        }
    }

    function handleUrl() {
        console.log("submitted");
        const url = (inputUrlElem as HTMLInputElement)?.value as string;
        loadFromUrl(url);

        (inputUrlElem as HTMLInputElement).value = "";
    }

    const frame = () => {
        controls.update();
        renderer.render(scene, camera);
 
        requestAnimationFrame(frame);
    };


    requestAnimationFrame(frame);
}

main(); 
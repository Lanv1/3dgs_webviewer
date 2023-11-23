import * as SPLAT from "gsplat";

const scene = new SPLAT.Scene();
const renderer = new SPLAT.WebGLRenderer();
const camera = new SPLAT.Camera();
const controls = new SPLAT.OrbitControls(camera, renderer.domElement);

const inputFileElem = document.getElementById("input_file");
const inputUrlElem = document.getElementById("input_url");
const submitUrlElem = document.getElementById("submit_url");


function loadFromFile(file : File) : void {
    const ext = file.name.slice(-5);  
    if(ext.slice(2) == "ply") {
        SPLAT.PLYLoader.LoadFromFileAsync(file, scene, () => {});
        console.log(".ply file loaded");
        
    } else if(ext == "splat") {
        SPLAT.Loader.LoadFromFileAsync(file, scene, () => {});
        console.log(".splat file loaded");
    
    } else {
        console.log("input file is neither has .ply or .splat extension.")
        
    }  
}

function loadFromUrl(url : string) : void {
    const ext = url.slice(-5);  
    if(ext.slice(2) == "ply") {
        SPLAT.PLYLoader.LoadAsync(url, scene, () => {});
        console.log(".ply file loaded");
        
    } else if(ext == "splat") {
        SPLAT.Loader.LoadAsync(url, scene, () => {});
        console.log(".splat file loaded");
    
    } else {
        console.log("input file is neither has .ply or .splat extension.")
    }  
}

async function main() {
    // const base_file_url = "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k.splat";
    const base_file_url = "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/kitchen/kitchen-7k.splat";
    await SPLAT.Loader.LoadAsync(base_file_url, scene, () => {});

    inputFileElem?.addEventListener("change", handleFiles, false);
    // inputUrlElem?.addEventListener("submit", handleUrl, false);
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
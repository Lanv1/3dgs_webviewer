import * as SPLAT from "gsplat";

const scene = new SPLAT.Scene();
const renderer = new SPLAT.WebGLRenderer();
let camera = new SPLAT.Camera();
const controls = new SPLAT.OrbitControls(camera, renderer.domElement);

const inputFileElem = document.getElementById("input_file");
const inputUrlElem = document.getElementById("input_url");
const submitUrlElem = document.getElementById("submit_url");
const camFileElem = document.getElementById("input_cam");
const exportBtnElem = document.getElementById("exportBtn");
const camSelectorBtnElem = document.getElementById("camSelector");


let progressElem = document.getElementById("progress_bar");
let loadingElem = document.getElementById("loading_bar");
let infoElem = document.getElementById("info_tab");
let camSelectorLabelElem = document.getElementById("selectedCam");
let canvasElem = document.querySelector("canvas");

let selectedCam = 0;
let cameras : any;

const useShs = true; // use shs to compute color or not

function updateProgress(progress : number) : void {
    (progressElem as HTMLProgressElement).value = 100 * progress;
}

function endProgress() : void {
    (loadingElem as HTMLElement).style.opacity = "0";
    (canvasElem as HTMLElement).style.opacity = "1";

}

async function loadFromFile(file : File) : Promise<void> {

    (loadingElem as HTMLElement).style.opacity = "1";
    (canvasElem as HTMLElement).style.opacity = "0.1";
    
    if(file.name.endsWith(".ply")) {
        console.log(".ply file loading from file");
        return await SPLAT.PLYLoader.LoadFromFileAsync(file, scene, updateProgress, undefined, useShs);
        
    } else if(file.name.endsWith(".splat")) {
        console.log(".splat file loaded from file");
        return await SPLAT.Loader.LoadFromFileAsync(file, scene, updateProgress);
        
    } else {
        console.log("input file is neither has .ply or .splat extension.");   
    }
}

async function loadFromUrl(url : string) : Promise<void> {
    (loadingElem as HTMLElement).style.opacity = "1";
    (canvasElem as HTMLElement).style.opacity = "0.1";

    if(url.endsWith(".ply")) {
        console.log(".ply file loaded from url");
        return await SPLAT.PLYLoader.LoadAsync(url, scene, updateProgress, undefined, useShs);
        
    } else if(url.endsWith(".splat")) {
        console.log(".splat file loaded from url");
        return await SPLAT.Loader.LoadAsync(url, scene, updateProgress);
    
    } else {
        console.log("input file is neither has .ply or .splat extension.")
    }  
}

async function main() {
    const base_file_url = "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/kitchen/kitchen-7k.splat";
    await SPLAT.Loader.LoadAsync(base_file_url, scene, updateProgress)
    .then(() => {(loadingElem as HTMLElement).style.opacity = "0";} );

    submitUrlElem?.addEventListener("click", () => {
        const url = (inputUrlElem as HTMLInputElement)?.value as string;
        loadFromUrl(url).then(endProgress);
        (inputUrlElem as HTMLInputElement).value = "";
    }, false);

    inputFileElem?.addEventListener("change", (event : Event) => {
        const input = event.target as HTMLInputElement;
        if(input.files && input.files.length) {
            const file = input.files[0];
            loadFromFile(file).then(endProgress);
        }
    }, false);


    camFileElem?.addEventListener("change", (event : Event) => {
        const input = event.target as HTMLInputElement;
        if(input.files && input.files.length) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                cameras = JSON.parse(e.target!.result as string);

                camera = SPLAT.Camera.fromData(cameras[selectedCam]);
                controls.setCamera(camera);
            };
            reader.onprogress = () => {
            };
            reader.readAsText(file);
            new Promise<void>((resolve) => {
                reader.onloadend = () => {
                    resolve();
                };
            });
            
            (camSelectorLabelElem as HTMLInputElement).value = "0";
        }
    });

    exportBtnElem?.addEventListener("click", () => {
        console.log("export clicked");
        camera.dumpSettings(renderer.domElement.width, renderer.domElement.height);
    });
    
    camSelectorBtnElem?.addEventListener("click", () => {
        console.log("next cam clicked");
        const nbCam = cameras.length;
        selectedCam = (selectedCam + 1) % nbCam;
        
        camera = SPLAT.Camera.fromData(cameras[selectedCam]);
        controls.setCamera(camera);

        (camSelectorLabelElem as HTMLInputElement).value = selectedCam.toString();
    });
    
    camSelectorLabelElem?.addEventListener("input", (event: Event) => {
        const val : number = parseInt((event.target  as HTMLInputElement).value);
        
        if (val < cameras.length) {
            selectedCam = val;
            camera = SPLAT.Camera.fromData(cameras[selectedCam]);
            controls.setCamera(camera);        
        }
    });

    let then = 0;
    let nbFrames = 0;
    let avgTime = 0;

    const frame = (now: any) => {
        
        controls.update();

        let before_draw = performance.now();
        renderer.render(scene, camera);
        let after_draw = performance.now();
        
        avgTime += (after_draw - before_draw);

        if(nbFrames % 100 == 0) {
            now *= 0.001;
            const dt = now - then;
            then = now;

            const fps = nbFrames / dt;
            (infoElem as HTMLElement).textContent = `fps: ${fps.toFixed(1)} | ${(avgTime / nbFrames).toFixed(3)} ms`;

            avgTime = 0;
            nbFrames = 0;
        }

        requestAnimationFrame(frame);
        nbFrames ++;
    };


    requestAnimationFrame(frame);
}

main(); 

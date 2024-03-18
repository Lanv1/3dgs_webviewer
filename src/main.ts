import * as SPLAT from "gsplat";

const scene = new SPLAT.Scene();
const renderer = new SPLAT.WebGLRenderer();
let camera = new SPLAT.Camera();
const controls = new SPLAT.OrbitControls(camera, renderer.domElement);

const hidePannelBtnWrap = document.getElementsByClassName("icon_wrap")[0];
const hidePannelBtn = document.querySelector("i");
const panelElem = document.querySelector(".panel");

let progressElem = document.getElementById("progress_bar");
let loadingElem = document.getElementById("loading_bar");
let loadingDesc = document.getElementById("loading_desc");
let infoElem = document.getElementById("info_tab");
let canvasElem = document.querySelector("canvas");

const parseElem = document.createElement('img');
parseElem.src = "https://repo-sam.inria.fr/fungraph/reduced_3dgs/icons/spinner.png"
parseElem.classList.add("spinner");
parseElem.classList.add("rotate-icon");

// (loadingElem as HTMLElement).style.opacity = "1";
// (canvasElem as HTMLElement).style.opacity = "0.1";
// loadingElem?.removeChild(progressElem as HTMLProgressElement);
// loadingElem?.appendChild(parseElem);

let barDesc = 'Loading'
let barProgress = 0
let isParsing = false;

let remainingTime = false;
let FPSrIC : number;
let FPS : number;

const scenes = [
    "bicycle",
    "bonsai",
    "counter",
    // "drjhonson",
    // "flowers",
    // "garden",
    "kitchen",
    // "playroom",
    // "room",
    // "stump",
    // "train",
    // "treehill",
    "truck"
];



function updateBar() {
    
    (loadingDesc as HTMLElement).textContent = `${barDesc} ${barProgress.toFixed(2)}`;
    if(barDesc == "Parsing" && !isParsing) {
        loadingElem?.removeChild(progressElem as HTMLProgressElement);
        loadingElem?.appendChild(parseElem);
        isParsing = true;
    } else {
        (progressElem as HTMLProgressElement).value = 100 * barProgress;
    }
}

function togglePannelDisplay() : void {
    panelElem?.classList.toggle("slide");
    // console.log(panelElem);

    hidePannelBtn?.classList.toggle("fa-greater-than");
    hidePannelBtn?.classList.toggle("fa-less-than");
    
    hidePannelBtnWrap?.classList.toggle("slide");
}


function buildCards() : void {
    const wrapperElem = document.createElement("div");
    wrapperElem.id = "card_wrapper";

    for(const scene of scenes) {
        const iconName = scene + ".png";
        const idNameQuantized = "quantized_"+scene;
        const idNameBaseline = "baseline_"+scene;
            
        {
            const iconImageWrapElem = document.createElement(`div`);
            iconImageWrapElem.classList.add("image");

            const imageElem = document.createElement("img");
            imageElem.src = `https://repo-sam.inria.fr/fungraph/reduced_3dgs/icons/${iconName}`;
            iconImageWrapElem.appendChild(imageElem);

            const cardElem = document.createElement("div");
            cardElem.classList.add("scene_card");
            cardElem.id = `${idNameQuantized}`;

            const iconWrapElem = document.createElement(`div`);
            iconWrapElem.classList.add("minia_wrap");
            
    
            const labelElem = document.createElement(`label`);
            labelElem.classList.add("desc");
            labelElem.textContent = `${scene} light`;
            
            iconWrapElem.appendChild(iconImageWrapElem);
            iconWrapElem.appendChild(labelElem);
    
            cardElem.appendChild(iconWrapElem);
            wrapperElem.appendChild(cardElem);
        }

        {
            const iconImageWrapElem = document.createElement(`div`);
            iconImageWrapElem.classList.add("image");

            const imageElem = document.createElement("img");
            imageElem.src = `https://repo-sam.inria.fr/fungraph/reduced_3dgs/icons/${iconName}`;
            iconImageWrapElem.appendChild(imageElem);

            const cardElem = document.createElement("div");
            cardElem.classList.add("scene_card");
            cardElem.id = `${idNameBaseline}`;

            const iconWrapElem = document.createElement(`div`);
            iconWrapElem.classList.add("minia_wrap");
            
    
            const labelElem = document.createElement(`label`);
            labelElem.classList.add("desc");

            labelElem.textContent = `${scene} heavy`;
            
            iconWrapElem.appendChild(iconImageWrapElem);
            iconWrapElem.appendChild(labelElem);
    
            cardElem.appendChild(iconWrapElem);
            wrapperElem.appendChild(cardElem);
        }
    }
    panelElem?.insertBefore(wrapperElem, hidePannelBtnWrap);
}

function enableCards() : void {
    const cardElems = document.querySelectorAll(".scene_card");

    cardElems.forEach((cardElem) => {
        cardElem.addEventListener("click", () => {

            togglePannelDisplay();
            const topOffset = (cardElem as HTMLElement).offsetTop;
            window.scroll(topOffset, 0);

            const sceneName = cardElem.id.split("_")[1];
            console.log("look for folder "+ sceneName);
            let url;
            
            if(cardElem.id.split("_")[0] === "quantized") {
                url = `https://repo-sam.inria.fr/fungraph/reduced_3dgs/scenes/${sceneName}/quantized_${sceneName}.ply`;
                console.log("URL quantized: " + url);
                loadFromUrl(url).then(endProgress);
            } else {
                url = `https://repo-sam.inria.fr/fungraph/reduced_3dgs/scenes/${sceneName}/baseline_${sceneName}.ply`;
                console.log("URL baseline: " + url);
                loadFromUrl(url, false).then(endProgress);
            }


        });
    });
}

const useShs = true; // use shs to compute color or not

let loading: boolean = false;

async function loadFile(file: File) {
    if (loading) return;
    loading = true;
    // Check if .splat file

    (loadingElem as HTMLElement).style.opacity = "1";
    (canvasElem as HTMLElement).style.opacity = "0.1";
    const format = "";
    // const format = "polycam"; // Uncomment to load a Polycam PLY file
    await SPLAT.PLYLoader.LoadFromFileAsync(
        file,
        scene,
        updateProgress,
        format,
        useShs,
        false    // flag to use quantized parser or not
    ).then(endProgress);
}


document.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer != null) {
        loadFile(e.dataTransfer.files[0]);
    }
});

function updateProgress(progress : number, loadingDone: boolean = false) : void {
    barProgress = progress;
    if(loadingDone) {
        barDesc = "Parsing";
    }
}

function endProgress() : void {
    (loadingElem as HTMLElement).style.opacity = "0";
    (canvasElem as HTMLElement).style.opacity = "1";
    barDesc = "Loading";
    loading = false;
    isParsing = false;
    loadingElem?.appendChild(progressElem as HTMLProgressElement);
    loadingElem?.removeChild(parseElem);
}

async function loadFromUrl(url : string, quantized : boolean = true) : Promise<void> {
    (loadingElem as HTMLElement).style.opacity = "1";
    (canvasElem as HTMLElement).style.opacity = "0.1";

    if (loading) return;
    loading = true;

    if(url.endsWith(".ply")) {
        console.log(".ply file loaded from url");
        return await SPLAT.PLYLoader.LoadAsync(url, scene, updateProgress, undefined, useShs, quantized);
        
    } else if(url.endsWith(".splat")) {
        console.log(".splat file loaded from url");
        return await SPLAT.Loader.LoadAsync(url, scene, updateProgress);
    
    } else {
        console.log("input file is neither has .ply or .splat extension.")
    }  
}

function fpsComputeRic(d : IdleDeadline) {
    // Calculate the actual time the frame took
	// and the according FPS
	const goal = 1000 / 60;
	const elapsed = goal - d.timeRemaining();
	FPSrIC = goal * 60 / elapsed;
    remainingTime = true;
}


async function main() {

    hidePannelBtn?.addEventListener("click", () => {
        togglePannelDisplay();
    });


    buildCards();
    enableCards();


    let then = 0;
    let nbFrames = 0;
    let avgTime = 0;

    const frame = (now: any) => {
        controls.update();

        let before_draw = performance.now();
        renderer.render(scene, camera);
        let after_draw = performance.now();

        if(loading)
            updateBar();
        
        avgTime += (after_draw - before_draw);

        if(nbFrames % 100 == 0) {
            now *= 0.001;
            const dt = now - then;
            then = now;

            FPS = nbFrames / dt;
            
            avgTime = 0;
            nbFrames = 0;
        }

        if(remainingTime && nbFrames % 100 == 0) {
            (infoElem as HTMLElement).textContent = `fps: ${FPSrIC.toFixed(1)}`;
        } else {
            (infoElem as HTMLElement).textContent = `fps: ${FPS.toFixed(1)}`;
        }

        remainingTime = false;

        requestIdleCallback(fpsComputeRic)
        requestAnimationFrame(frame);
        nbFrames ++;
    };


    requestAnimationFrame(frame);
}

main(); 
import * as SPLAT from "gsplat";

const scene = new SPLAT.Scene();
const camera = new SPLAT.Camera();
const renderer = new SPLAT.WebGLRenderer();
const controls = new SPLAT.OrbitControls(camera, renderer.domElement);

const inputElement = document.getElementById("input");

async function main() {
    // const url = "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k.splat";
    // const url = "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/kitchen/kitchen-7k.splat";
    // await SPLAT.Loader.LoadAsync(url, scene, () => {});

    inputElement?.addEventListener("change", handleFiles, false);
    
    function handleFiles(this: any) {
        const file = this.files[0]; /* now you can work with the file list */

        console.log("file loaded");
        SPLAT.Loader.LoadFromFileAsync(file, scene, () => {});

        const frame = () => {
            controls.update();
            renderer.render(scene, camera);
    
            requestAnimationFrame(frame);
        };
    
        requestAnimationFrame(frame);
    }

}

main(); 
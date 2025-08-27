const darkmode=document.querySelector(".theme");
const promptbtn=document.querySelector(".promptbut");
const promptIn=document.querySelector(".promptinput");
const promptform=document.querySelector(".prompt");
const generatebtn=document.querySelector(".generate-btn");
const modelSelect=document.getElementById("model-select");
const countSelect=document.getElementById("count-select");
const ratioSelect=document.getElementById("ratio-select");
const gridgallery=document.querySelector(".gallery-grid");
const API_KEY = "Your Api Key"; //hugging face API key

const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch's cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases",
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
    "A cosmic beach with glowing sand and an aurora in the night sky",
    "A medieval marketplace with colorful tents and street performers",
    "A cyberpunk city with neon signs and flying cars at night",
    "A peaceful bamboo forest with a hidden ancient temple",
    "A giant turtle carrying a village on its back in the ocean",
  ];


(() => {
    const savedtheme=localStorage.getItem("theme1");
    const systemprefers=window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDarktheme = savedtheme === "dark" || (!savedtheme && systemprefers);
    document.body.classList.toggle("dark-theme" , isDarktheme);
    darkmode.querySelector("i").className=isDarktheme?"fa-solid fa-sun" : "fa-solid fa-moon";
})();

//switching bt the light theme and dark theme.
const toggletheme=()=>{
    const isDarktheme=document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme1", isDarktheme? "darks" : "light");
    darkmode.querySelector("i").className=isDarktheme?"fa-solid fa-sun" : "fa-solid fa-moon";
};

const getImageDimensions = (aspratio, baseSize = 512) => {
    const[width, height] = aspratio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedwidth = Math.round(width * scaleFactor);
    let calculatedheight= Math.round(height * scaleFactor);


    calculatedwidth=Math.floor(calculatedwidth / 16) * 16;
    calculatedheight = Math.floor(calculatedheight / 16) * 16;

    return { width: calculatedwidth, height: calculatedheight};
};

const updateImageCards = (imgIndex, imgUrl) => {
    const imgcard = document.getElementById(`img-card-${imgIndex}`);
    if(!imgcard) return;

    imgcard.classList.remove("loading");
    imgcard.innerHTML = `<img src="${imgUrl}" alt="" class="result-img">
                        <div class="overlay">
                            <a herf="${imgUrl}" class="imgdown" download="${Date.now()}.png">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div>`;
}

const generateImages = async (selectedMo, imageco, aspratio, prompttext) => {
    const MODEL_URL=`https://router.huggingface.co/hf-inference/models/${selectedMo}`;
    const {width, height}=getImageDimensions(aspratio);
    generatebtn.setAttribute("disabled", "true");

    const imagePromises = Array.from({length: imageco}, async(_, i) => {
        try {
            const response = await fetch(MODEL_URL, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "x-use-cache": false,
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompttext,
                    parameters: {width, height},
                }),
            });

            if(!response.ok) throw new Error((await response.json())?.error);
    
            const result = await response.blob();
            updateImageCards(i, URL.createObjectURL(result));
        } catch (error) {
            console.log(error);
        }
    });

    await Promise.allSettled(imagePromises);
    generatebtn.removeAttribute("disabled");
};

const createImageCards = (selectedMo, imageco, aspratio, prompttext) => {
    gridgallery.innerHTML = "";

    for (let i = 0; i < imageco; i++) {
        gridgallery.innerHTML+=`<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspratio}">
                        <div class="statuscon">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                                <p class="statustext">Generating...</p>
                            
                        </div>
                    </div>`;
    }

generateImages(selectedMo, imageco, aspratio, prompttext);

};

const handleFormsSubmit = (e) => {
    e.preventDefault();

    const selectedMo=modelSelect.value;
    const imageco=parseInt(countSelect.value) || 1;
    const aspratio=ratioSelect.value || "1/1";
    const prompttext=promptIn.value.trim();

   createImageCards(selectedMo, imageco, aspratio, prompttext);
}

promptbtn.addEventListener("click",() =>{
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptIn.value = prompt;
    promptIn.focus();
})

promptform.addEventListener("submit", handleFormsSubmit)
darkmode.addEventListener("click", toggletheme);

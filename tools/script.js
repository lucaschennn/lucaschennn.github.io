import captions from "../src/assets/captions.json" assert {type: "json"};

console.log(captions.version);

$("#btn-1").click(() => {
    console.log("btn1")
})

$("#btn-2").click(() => {
    console.log("btn2")
})

$("#btn-3").click(() => {
    console.log("btn3")
})

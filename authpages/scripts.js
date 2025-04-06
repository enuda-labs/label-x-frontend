const container = document.querySelector(".auth-container")
const registerBtn = document.querySelectorAll(".signup-btn")
const loginBtn = document.querySelector(".login-btn")

registerBtn.forEach((btn)=>{
    btn.addEventListener("click", ()=>{
        container.classList.add("active");
    });
})

loginBtn.addEventListener("click", ()=>{
    container.classList.remove("active");
});
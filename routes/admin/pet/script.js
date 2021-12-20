const form = document.getElementById("form")
const uploadedImgElem = document.getElementById("uploaded-img")

form.addEventListener("submit", submitForm)

function submitForm(e) {
    e.preventDefault()
    const fileInput = document.getElementById("file")
    const file = fileInput.files[0]
    const formData = new FormData()
    formData.append("file", file)
    const response = fetch("http://localhost:3000/admin/pet/add", {
            method: "post",
            body: formData,
        })
        .then(res => (uploadedImgElem.src = response.url))
        .catch(err => ("Error occured", err))
}
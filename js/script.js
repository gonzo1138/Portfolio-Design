document.addEventListener('DOMContentLoaded', function() {

    displayContent("start");

    // Info schließen
    let infoCloseButton = document.getElementById('infoclose');
    infoCloseButton.addEventListener('click', hideParentElement);

    function hideParentElement(e){
        e.target.parentElement.style.display="none";
    }

    // Navigationslinks

    var navitems = document.querySelectorAll('.navlink');
    //navitems = navitems + document.querySelectorAll('.order');
    //console.log(allSpans);
    navitems.forEach((item)=>{
        item.addEventListener("click",function(event){
            displayContent(event.target.id.slice(1, event.target.id.length));
        });
    });

    function displayContent(ID){
        let content = document.getElementById('content');
        content.innerHTML = "";
        let newContent = document.getElementById(ID).cloneNode(true);
        newContent.style.display="block";
        newContent.className="displayed";
        let newElement = document.createElement("div");
        newElement.append(newContent);
        document.getElementById("content").appendChild(newElement);
    }
});
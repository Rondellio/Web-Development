// JavaScript source code
function filterCharsByClass() {
    //get the id of the selected homeworld from the filter dropdown
    var class_id = document.getElementById('class_filter').value
    //construct the URL and redirect to it
    window.location = '/charBuild/filter/' + parseInt(class_id)
}
//dev
fetch('http://localhost:8000/datasets/cappricing.json')
	.then(response => response.json())
	.then(data => console.log(data));

//generic init function
// init(datasets){
// //entry point
// }
// //in  mode
// init(window.datasets);
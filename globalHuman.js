console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  
    
   

    /* 
    
    // make an array of the links in navbar
    
    // .find "method" on arrays return the first result
    
    
    
  


    
    // if (currentLink) {
    // // or if (currentLink !== undefined)
    //     currentLink.classList.add('current');
    // }
    
    currentLink?.classList.add('current');
    
    */

    



    // let pages = [
    //     { url: '', title: 'Home' },
    //     { url: 'projects/', title: 'Projects' },
    //     { url: 'contact/', title: 'Contact' },
    //     { url: 'resume/', title: 'Resume' },
    // ];



    // let nav = document.createElement('nav');
    // document.body.prepend(nav);
    



    // for (let p of pages) {
    //     let url = p.url;
    //     let title = p.title;
        // TODO create link and add it to nav
        // TODO how to assign that attribute from(to?) nav
            // let link = nav.a;
    // }
    
    
    // create each link and add it to nav(how is this accessing pages?)
    // nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
    
    return Array.from(context.querySelectorAll(selector));


  
}

const navLinks = $$("nav a")
const currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);
currentLink?.classList.add('current');


/* 
async function
    handle errors for the "curl"
renderProjects Function
    // btw how to extend an interface in js

    @param project : which project from the html to lift
    @param containerElement : where it's actually located on the page?
    @param headingLevel : validate for 1 - 5 values h1, h2, etc.



    
    // TODO why use the article element

    // TODO how is using document.createElement not considered as appending to the HTML

# TODO post 3 projects for the website




*/
// default size of Note
var DEFAULT_WIDTH = 250;
var DEFAULT_HEIGHT = 100;

// =======================
//     String Generator
// =======================

var string_generator = function (length) {
    length = length || 12;
    // initialize characters set
    var symbols = "abcdefghijklmnopqrstuvwxyz"; 
    symbols += symbols.toUpperCase();
    symbols += "0123456789";

    var string = "";
    for (var i = 0; i < length; i += 1) {
        var index = ~~(Math.random() * symbols.length);
        string += symbols.charAt(index);
    }
    return string;
};

// =====================
//      Sign In Box
// =====================

function signin() {
    var box = document.getElementById('signinbox');
    var userid = document.getElementById('userid').value;
    var userpsw = document.getElementById('userpsw').value;
    var btsignin = document.getElementById('btSignIn');
    btsignin.style.width = "150px"
    if (box.style.display == 'none') {
        btsignin.innerHTML = "Sign In";
        box.style.display = 'initial';
    }
    else if (userid != '' && userpsw != '') {
        btsignin.innerHTML = "Welcome, " + userid;
        btSignIn.style.width = "30%";
        box.style.display = 'none';
    }
    // alert
    else if (userid == '') btsignin.innerHTML = "Id?";
    else btsignin.innerHTML = "Password?";
}

// ==============================
// requestAnimationFrame polyfill

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
} ());

// =====================
//         Timer
// =====================

var update_time = function () {
    var now = new Date();

    var hour = now.getHours();
    if (hour > 12) hour -= 12;
    if (hour < 1) hour += 12;

    var minutes = now.getMinutes();
    if (minutes < 10) minutes = "0" + minutes;
    
    var ampm = " am";
    if (hour >= 12) ampm = " pm";

    document.getElementById("clock").innerText = hour + ":" + minutes + ampm;
    requestAnimationFrame(update_time);
};

// ======================
//      Sticky Note 
// ======================

var priority = 0;
var note_count = 0;
var instruction = document.getElementById("instruction");
var Note = function (point, id) {
    var note = this;

    // save note's content to JSON file
    this.save = function (content) {
        var notes = JSON.parse(localStorage.getItem("notes")) || {};
        var element = this.element();
        // attributes correspond with id: content, location
        notes[note.id] = {
            "content": content,
            "x": (1.0 * parseInt(element.style.left) + DEFAULT_WIDTH / 2) / window.innerWidth,
            "y": (1.0 * parseInt(element.style.top) + DEFAULT_HEIGHT / 2) / window.innerHeight
        };
        localStorage.setItem("notes", JSON.stringify(notes));
    };

    // remove a note from JSON file
    this.destroy = function (removeElement) {
        var notes = JSON.parse(localStorage.getItem("notes")) || {};
        // if note id exists in notes, remove it from notes
        if (note.id in notes) 
            delete notes[note.id];
        localStorage.setItem("notes", JSON.stringify(notes));
        if (removeElement) {
            document.getElementById("notes").removeChild(this.element());
	        note_count--;
	        if (note_count == 0)
	        	instruction.style.visibility = "visible";        
        }
	};

    this.element = function () {
        var el;
        if ((el = document.getElementById("note-" + note.id)) != null) {
            return el;
        } 
        else {
            // location is controlled by javascript instead of css
            el = document.createElement("div");
            el.id = "note-" + note.id;
            // inherit attributes from css note class
            el.classList = "note";
            // needs to be "absolute" becasue notes can be on top each other
            el.style.position = "absolute";
            // set default size
            el.style.width = DEFAULT_WIDTH;
            el.style.height = DEFAULT_HEIGHT;
            // set location
            var px = point.x - (DEFAULT_WIDTH / 2);
            var py = point.y - (DEFAULT_HEIGHT / 2);
            if (px < 0) px = 0;
            if (px + DEFAULT_WIDTH > window.innerWidth)
                px = window.innerWidth - DEFAULT_WIDTH;
            if (py < 50) py = 50;
            if (py + DEFAULT_HEIGHT > window.innerHeight)
                py = window.innerHeight - DEFAULT_HEIGHT;
            el.style.left = px;
            el.style.top = py;

            priority++;
            el.style.zIndex = priority;
            el.dragging = false;
            document.getElementById("notes").appendChild(el);

            el.onclick = function(event) {            
                priority++;
                el.style.zIndex = priority;
            }
            // check whether a note is clicked
            el.onmousedown = function (event) {
                console.log("Event: Mouse down, X = ", event.clientX, ", Y = ", event.clientY)
                // move the note to the front, only works when position is absolute
                // event.target is the element clicked on screen
                if (event.target == el) {
                    el.dragging = true;
                    el.dragpoint = { x: event.clientX, y: event.clientY };

                    // style of the cursor; for example, it is "move" cursor when mouse is down
                    el.style.cursor = "move";
                }
            };
            el.onmouseup = function () {
                el.dragging = false;
                console.log("Event: Mouse up, X = ", event.clientX, ", Y = ", event.clientY);
                // return to default state, very straightforward, no need to explain
                el.style.cursor = "default"; 
            };
            // after finish typing content for a note
            el.onkeyup = function () {
            	if (event.keyCode == 27)
            		checkDelete();
            	else {
	                var content = editor.innerHTML.trim();
	                if (content.length > 0) {
	                    note.relocateContent(editor.innerText);
	                    note.save(content);
	                } 
	                else {
	                    // delete if nothing is typed
	                    el.style.height = DEFAULT_HEIGHT;
	                    note.destroy();
	                }
            	}
            };

            /*
                add button File to note
                attach a picture, img, or video link when the button is clicked                
            */

            var btnFile = document.createElement("a");
            btnFile.classList = "file";
            // &times is "x" shown on the screen
            btnFile.innerHTML = "+";
            btnFile.onclick = function () {
                console.log("Attach File button is clicked");
                /*
                var attach = document.getElementById("attach");
                attach.style.display = "initial";
                */
            };
            el.appendChild(btnFile);

            // add button Delete to note
            var btnDel = document.createElement("a");
            btnDel.classList = "close";            
            btnDel.innerHTML = "&times"; // alternative: "&#x274C" is red "x" shown on the screen
            btnDel.onclick = function () {
                console.log("Delete button is clicked");
                checkDelete();                
            };
            var checkDelete = function() {
            	// content length = 0 or (content length > 0 && pop-up box to confirm deleting a note)
                var content = editor.innerHTML.trim();
                if (content.length <= 0 || confirm("Are you sure you want to delete this note? This cannot be undone!")) {
                    /*
                        if user blocks confirm pop-up 
                        then this is a serious issue that needs to be taken care of
                    */
                    console.log("A Note with id", note.id, "has just been deleted!");
                    note.destroy(true);
                }
            }
            el.appendChild(btnDel);

            // creating text field
            var editor = document.createElement("div");
            editor.classList = "editor";
            editor.contentEditable = true;
            el.appendChild(editor);            

            note.setContent = function (content) {
                // it is very important to set up div tag for relocate function to work
                editor.innerHTML = content;
                console.log("First line content: ", editor.innerText.split("\n")[0]);    
                console.log("X = ", el.style.left, ", Y = ", el.style.top);
                note.relocateContent(editor.innerText);
            };

            note.relocateContent = function (content) {                
                // Relocate the horizontal length
                var divs = content.split("\n");
                var maxHorizontalLength = 21;
                // find the line with max length
                for (div of divs) {
                    maxHorizontalLength = Math.max(maxHorizontalLength, div.length);
                }
                console.log("Lines' max length: ", maxHorizontalLength);
                el.style.width = DEFAULT_WIDTH + (maxHorizontalLength - 20) * 11;

                // Relocate the vertical length
                // count the number of lines to set size of the content                
                var lines = (content.match(/\n/g) || []).length;
                console.log("Number of lines: ", lines + 1);
                el.style.height = DEFAULT_HEIGHT + (lines - 1) * 25;
            }

            editor.focus();
            note_count++;            
        	instruction.style.visibility = "hidden";
            return el;
        }
    };

    if (id) {
        this.id = id;
    } 
    // if there is no id, generate one from random string generator
    else {
        this.id = string_generator();
        // check for collisions
        while (Note.get(this.id) != null) {
            this.id = string_generator(); 
        }
    }
    console.log("--------------------");
    console.log("A new Note is created with id: ", this.id);
    this.element();
};

// retrive saved sticky notes
Note.get = function (id) {
    var notes = JSON.parse(localStorage.getItem("notes")) || {};
    if (id in notes) {
        return notes[id];
    } 
    else {
        return null;
    }
};

// 
Note.load = function (id, save) {
    var x = save.x * window.innerWidth;
    var y = save.y * window.innerHeight;
    var note = new Note({ x: x, y: y }, id);
    note.setContent(save.content);
};

// ======================
//          END
// ======================

var clearNote = function () {
    var children = document.getElementById("notes").children;
    /*
    using alternative: for-of
    for (var i = 0; i < children.length; i += 1) {
        var child = children[i];
    */
    for (child of children) {
        if (!(child.tagName.toLowerCase() == "div" && child.className.indexOf("note") > -1)) 
            continue;
        var id = child.id.replace("note-", "");
        if (!Note.get(id)) {
            document.getElementById("notes").removeChild(child);
        }
    }
};

// whenever a double-click on dashboard is initiated, create a note
var onCreate = function (event) {
    console.log(event);
    // if event target is not the dashboard, we return
    if (event.target != document.getElementById("notes"))
        return;
    clearNote();
    var note = new Note({ x: event.clientX, y: event.clientY });
};

// drag a note to a different position
var onDrag = function (event) {
    if (event.buttons & 1) {
        var children = document.getElementById("notes").children;
        for (var i = 0; i < children.length; i += 1) {
            var el = children[i];
            if (el.dragging) {
                var dx = event.clientX - el.dragpoint.x;
                var dy = event.clientY - el.dragpoint.y;
                var left = parseInt(document.getElementById(el.id).style.left);
                var top = parseInt(document.getElementById(el.id).style.top);
                document.getElementById(el.id).style.left = (left + dx) + "px";
                document.getElementById(el.id).style.top = (top + dy) + "px";
                el.dragpoint = { x: event.clientX, y: event.clientY };

                var notes = JSON.parse(localStorage.getItem("notes")) || {};
                var id = el.id.replace("note-", "");
                if (id in notes) {
                    notes[id].x = 1.0 * (parseInt(document.getElementById(el.id).style.left) + DEFAULT_WIDTH / 2) / window.innerWidth;
                    notes[id].y = 1.0 * (parseInt(document.getElementById(el.id).style.top) + DEFAULT_HEIGHT / 2) / window.innerHeight;
                }
                localStorage.setItem("notes", JSON.stringify(notes));
                break;
            }
        }
    }
};

// onLoad method
var onLoad = function () {
    var notes = JSON.parse(localStorage.getItem("notes"));
    for (var id in notes) {
        var note = Note.load(id, notes[id]);
    }
};

var navbar = document.getElementById('navbar');
var onNavigate = function(event) {
    if (event.clientY <= 50)
        navbar.style.display = "block";
    else navbar.style.display = "none";
}

// initialization
var onInit = function () {    
    navbar.style.display = "none";
    try {
        // store JSON file in local storage
        JSON.parse(localStorage.getItem("notes"));
    } 
    catch (e) {
        console.log("Local storage corrupted, re-setting...");
        localStorage.setItem("notes", JSON.stringify({}));
    }

    requestAnimationFrame(update_time);
    document.getElementById("notes").ondblclick = onCreate;
    document.getElementById("notes").onmousemove = onDrag;

    document.getElementById("background").onmousemove = onNavigate;
    onLoad();
};

// program starts here
onInit();
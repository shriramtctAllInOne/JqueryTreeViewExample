//recursive function to create child inside parent
function createChildren(childDoc) {
	$.each(childDoc, function(index1, currentChildDoc) {
		tr = $("<tr data-tt-id='" + currentChildDoc.DocId
				+ "'data-tt-parent-id='" + currentChildDoc.parentID + "'>");
		tr.append("<td> <span class='file' id =" + currentChildDoc.DocId + ">"
				+ currentChildDoc.fileName + "</span></td>");
		tr.append("<td>" + currentChildDoc.docType + "</td>");
		tr.append("<td>"
				+ ((currentChildDoc.iconCls == "fileName-folder") ? '--'
						: currentChildDoc.fileSize) + "</td>");
		tr.append("<td> <span class='icon-mini-edit' id =add-"
				+ currentChildDoc.DocId
				+ "/><span class='icon-mini-remove' id =remove-"
				+ currentChildDoc.DocId
				+ "/><span class='icon-mini-upload' id =upload-"
				+ currentChildDoc.DocId + "/></td>");
		tr.append("</tr>");

		$('#example-advanced').append(tr);
		if (currentChildDoc.iconCls == "fileName") {
			$("#add-" + currentChildDoc.DocId).removeClass('icon-mini-edit');
			$("#upload-" + currentChildDoc.DocId).removeClass(
					'icon-mini-upload');
			$("#upload-" + currentChildDoc.DocId)
					.addClass('icon-mini-download');
		}
		if (currentChildDoc.iconCls == "fileName-folder") {
			$("#" + currentChildDoc.DocId).addClass('folder');
			$("#" + currentChildDoc.DocId).removeClass('file');
		}

		if (currentChildDoc.children != null) {
			var childDocChild = currentChildDoc.children;
			createChildren(childDocChild);
		}

	});
}
var deletedRowId;
var counter = 1;

$(document)
		.ready(
				function() {
					$("#hiddendiv").hide();
					
					$("#Admin").click(function(){
						$.ajax({
							type : "POST",
							url : "/JqueryTreeViewExample/ConnectDBServlet",
							success : function(data) {
								var documents = data.children;
								var tr;
								$
										.each(
												documents,
												function(index,
														currentDocument) {
													tr = $("<tr data-tt-id='"
															+ currentDocument.DocId
															+ "'>");
													tr
															.append("<td> <span class='file' id ="
																	+ currentDocument.DocId
																	+ ">"
																	+ currentDocument.fileName
																	+ "</span></td>");
													tr
															.append("<td>"
																	+ currentDocument.docType
																	+ "</td>");
													tr
															.append("<td>"
																	+ ((currentDocument.iconCls == "fileName-folder") ? '--'
																			: currentDocument.fileSize)
																	+ "</td>");
													tr
															.append("<td> <span class='icon-mini-edit' id =add-"
																	+ currentDocument.DocId
																	+ "/><span class='icon-mini-remove'id=remove-"
																	+ currentDocument.DocId
																	+ "/><span class='icon-mini-upload' id =upload-"
																	+ currentDocument.DocId
																	+ "/></td>");
													tr.append("</tr>");
													$('#example-advanced')
															.append(tr);
													if (currentDocument.children != null) {
														var childDoc = currentDocument.children;
														createChildren(childDoc);
													}
													if (currentDocument.iconCls == "fileName-folder") {
														$(
																"#"
																		+ currentDocument.DocId)
																.addClass(
																		'folder');
														$(
																"#"
																		+ currentDocument.DocId)
																.removeClass(
																		'file');
													}
												});
								loadtreeview();
							},
							error : function(e) {
								alert("Invalid Request !");
							}
						});
					});
					

					$('#Save').click(function() {
						var table = $('#example-advanced').tableToJSON(); // Convert
						// the table
						// into a
						// javascript
						// object
						console.log(table);
						var jsonData = JSON.stringify(table);
						var deleteData = $("#hiddendiv").text();
						// alert(jsonData);
						// alert(deleteData);
						$.ajax({
							type : "POST",
							url : "/JqueryTreeViewExample/UpdateServlet",
							data : {
								jsonData : jsonData,
								deleteData : deleteData
							},
							success : function(data) {
								console.log("Data is saved Successfully");
							}
						});
					});

				});
function loadtreeview() {
	$("#example-advanced").treetable({
		expandable : true,
		clickableNodeNames : true
	});
	// $("tr:even").addClass("even");
	$("#example-advanced .folder").each(
			function() {
				$(this).parents("tr")
						.droppable(
								{
									accept : ".file, .folder",
									drop : function(e, ui) {
										var droppedEl = ui.draggable
												.parents("tr");
										$("#example-advanced").treetable(
												"move", droppedEl.data("ttId"),
												$(this).data("ttId"));
										$(this).addClass("modified");
										//console.log($(this));
									},
									hoverClass : "accept",
									over : function(e, ui) {
										var droppedEl = ui.draggable
												.parents("tr");
										if (this != droppedEl[0]
												&& !$(this).is(".expanded")) {
											$("#example-advanced").treetable(
													"expandNode",
													$(this).data("ttId"));
										}
									}
								}
						);
			});

	// Drag & Drop Example Code
	$("#example-advanced .file, #example-advanced .folder").draggable({
		helper : "clone",
		opacity : .75,
		refreshPositions : true, // Performance?
		revert : "invalid",
		revertDuration : 300,
		scroll : true
	});
	// Highlight selected row
	$("#example-advanced tbody").on("mousedown", "tr", function() {
		$(".selected").not(this).removeClass("selected");
		$(this).toggleClass("selected");
	});

	$("[id*='add']").click(function() {
		addFolder($(this));
	});
	$("[id*='remove']").click(function() {
		removeNode($(this));
	});
	$("[id*='upload']")
			.click(
					function() {
						var trclass = $(
								$(this).parent().parent().children("td").find(
										"span")[1]).attr("class");
						if (trclass.indexOf("folder") >= 0) {
							addFile($(this));
						} else {
							downloadFile($(this));
						}
					});
}
// fucntion to create new child inside parent on click on + button

function addFolder(node) {
	var eventID = node.attr("id");
	console.log("event-id-------->" + eventID);
	console.log("tr id----------->" + ($(node.parent().parent())).attr("data-tt-id"));
	var id = eventID.substr(eventID.indexOf("-") + 1);
	console.log("id-------->" + id);
	console.log("idaddfolder"+id);
	var subject = jQuery('#example-advanced').treetable().data("treetable").tree[id];
	var folder = subject.isBranchNode();
	var trclass = $(node.parent().parent().children("td").find("span")[1])
			.attr("class");
	console.log((folder || trclass.indexOf("folder") >= 0) ? true : false);
	if (folder || trclass.indexOf("folder") >= 0) {
		var fileName = prompt("Please provide the folder name", "");
		var foldersize = "--";
		console.log(fileName + "::::::" + node);
		if (fileName != null && fileName != '') {
			var DocType;
			node.parent().parent().children("td").each(
					function(cellIndex, cell) {
						if (cellIndex == 1) {
							DocType = $.trim($(cell).text());
						}
					});
			var tr = "<tr class=\"added\" data-tt-id=\"" + id + "-"
					+ counter + "\" data-tt-parent-id=\"" + id + "\"id=\"" + id + "\">"
					+ "<td> <span class='folder'>" + fileName + "</span></td>"
					+ "<td>" + DocType + "</td>" + "<td>" + foldersize
					+ "</td>" + "<td> <span class='icon-mini-edit' id ='add-"
					+ id + "-" + counter
					+ "'/><span class='icon-mini-remove' id ='remove-" + id + "-" + counter
					+ "'/><span class='icon-mini-upload' id ='upload-" + id
					+ "-" + counter + "'/></td>" + "</tr>";
			console.log(tr);
			var streamsRow = jQuery(tr);
			cquoi = jQuery(streamsRow);
			var newNode = jQuery('#example-advanced').treetable("node", id);
			jQuery("#example-advanced").treetable("loadBranch", newNode, cquoi);
			newNode.render();
			jQuery("#example-advanced").treetable("expandNode", id);
			console.log(id);
			$("#add-" + id + "-" + counter).click(function() {
				addFolder($(this));
				
			});
			 $("#remove-" + id + "-" + counter).click(function() {
			 removeNode($(this));
			 });
			$("#upload-" + id + "-" + counter).click(function() {
				console.log('asdas');
				addFile($(this));
			});
			counter++;
		} else {
			console.log('filename not found');
		}
	}
}
// To remove the child nodes
function removeNode(leaf) {
	var eventID = leaf.attr("id");
	console.log("event-id-------->" + eventID);
	var id = eventID.substr(eventID.indexOf("-") + 1);
	console.log("id-------->" + id);
	var node = jQuery('#example-advanced').treetable("node", id);
	var subject = jQuery('#example-advanced').treetable().data("treetable").tree[id];
	var folder = subject.isBranchNode();
	var trclass = $(leaf.parent().parent().children("td").find("span")[1])
			.attr("class");
	var isRemove = confirm("Do you really want to delete this "
			+ ((folder || trclass.indexOf("folder") >= 0) ? 'folder and all its contents?'
					: 'file?'));
	if (isRemove) {
		
	
	        var node = $("#example-advanced").data("treetable").tree[id];
	        var siblings = node.parentNode().children;
	        $("#example-advanced").data("treetable").unloadBranch(node);
	        node.row.remove();
	        var i = $.inArray(node, siblings);
	        siblings.splice(i, 1);
	        if (siblings.length === 0) {
	            $(node.parentNode().indenter[0]).empty();
	        }
			var currentTR = $(leaf.parent().parent());
			currentTR.addClass("deleted");
	
		
	}
}

function addFile(node) {
	var eventID = node.attr("id");
	var id = eventID.substr(eventID.indexOf("-") + 1);
	var fileName = prompt("Please provide the file name");
	
	if (fileName != null && fileName != '') {
		var DocType;
		node.parent().parent().children("td").each(function(cellIndex, cell) {
			if (cellIndex == 1) {
				DocType = $.trim($(cell).text());
			}
		});
		var tr = "<tr class=\"added\" data-tt-id=\"" + id + "-" + counter
				+ "\" data-tt-parent-id=\"" + id + "\">"
				+ "<td> <span class='file'>" + fileName + "</span></td>"
				+ "<td>" + DocType + "</td>" + "<td>0</td>"
				+ "<td> <span id ='file-" + id + "-" + counter
				+ "'/><span class='icon-mini-remove' id ='remove-" + id + "-"
				+ counter + "'/><span class='icon-mini-download' id =upload-"
				+ id + "-" + counter + "'/></td>" + "</tr>";
		var streamsRow = jQuery(tr);
		cquoi = jQuery(streamsRow);
		var newNode = jQuery('#example-advanced').treetable("node", id);
		jQuery("#example-advanced").treetable("loadBranch", newNode, cquoi);
		newNode.render();
		jQuery("#example-advanced").treetable("expandNode", id);
		$("#upload-" + id + "-" + counter).click(function() {
			downloadFile($(this));
		});
		$("#remove-" + id + "-" + counter).click(function() {
			removeNode($(this));
		});
		counter++;
	}
}

function downloadFile(node) {
	console.log('TBD: Download of file: '
			+ $(node.parent().parent().children("td").find("span")[1]).text());
}
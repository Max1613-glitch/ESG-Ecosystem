const buttonsContainer = document.getElementById('events-buttons-container');
        const mainContentWrapper = document.getElementById('main-content-wrapper');
        const createBtnAction = document.getElementById('btn-create-event-action');
        const eventTitleInput = document.getElementById('new-event-title-input');
        const contextMenu = document.getElementById('custom-context-menu');
        const contextMenuDeleteBtn = document.getElementById('context-menu-delete-btn');
        const btnUndoEventAction = document.getElementById('btn-undo-event-action');
        
        let activeDashboardRole = 'super-admin'; 
        let targetButtonToDelete = null;
        let lastDeletedEventState = null; // Map index tracker for recovery

        const sidebarButtons = document.querySelectorAll('.sidebar-menu-item');
        const dashboardMainTitle = document.getElementById('dashboard-main-title');
        const roleIndicator = document.getElementById('role-simulator-indicator');
        const sidebarRoleFooter = document.getElementById('sidebar-role-footer');
        const createFormWrapper = document.getElementById('create-event-form-wrapper');
        const rightClickNotice = document.getElementById('right-click-notice');
        const broadcastManagementCard = document.getElementById('broadcast-management-card');

        sidebarButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sidebarButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeDashboardRole = btn.getAttribute('data-role');

                if (activeDashboardRole === 'super-admin') {
                    dashboardMainTitle.innerText = "Super Admin Dashboard";
                    roleIndicator.innerText = "Simulate Role: R5 - Super Admin";
                    sidebarRoleFooter.innerText = "Role: Super Admin (R5)";
                    createFormWrapper.style.display = 'flex'; 
                    rightClickNotice.style.display = 'inline'; 
                    if(broadcastManagementCard) broadcastManagementCard.style.display = 'block';
                    if(lastDeletedEventState) btnUndoEventAction.style.display = 'inline-block';
                } else {
                    dashboardMainTitle.innerText = "Administration Dashboard";
                    roleIndicator.innerText = "Simulate Role: R4 - Operations Admin";
                    sidebarRoleFooter.innerText = "Role: Administrator (R4)";
                    createFormWrapper.style.display = 'none'; 
                    rightClickNotice.style.display = 'none'; 
                    if(broadcastManagementCard) broadcastManagementCard.style.display = 'none';
                    btnUndoEventAction.style.display = 'none';
                }
                const activeEventBtn = buttonsContainer.querySelector('.event-btn.active');
                document.getElementById('breadcrumb-text').innerText = `${dashboardMainTitle.innerText} / ${activeEventBtn ? activeEventBtn.innerText : ''}`;
            });
        });

        buttonsContainer.addEventListener('click', (e) => {
            const clickedBtn = e.target.closest('.event-btn');
            if (!clickedBtn) return;
            document.querySelectorAll('.event-btn').forEach(b => b.classList.remove('active'));
            clickedBtn.classList.add('active');
            document.querySelectorAll('.event-details-panel').forEach(panel => panel.classList.remove('active-details'));
            const targetPanelId = clickedBtn.getAttribute('data-target');
            const targetPanel = document.getElementById(targetPanelId);
            if(targetPanel) targetPanel.classList.add('active-details');
            document.getElementById('breadcrumb-text').innerText = `${dashboardMainTitle.innerText} / ${clickedBtn.innerText}`;
        });

        buttonsContainer.addEventListener('contextmenu', (e) => {
            if (activeDashboardRole !== 'super-admin') return; 
            const clickedBtn = e.target.closest('.event-btn');
            if (!clickedBtn) return;
            e.preventDefault();
            targetButtonToDelete = clickedBtn;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.display = 'block';
        });

        contextMenuDeleteBtn.addEventListener('click', () => {
            if (!targetButtonToDelete) return;
            const targetPanelId = targetButtonToDelete.getAttribute('data-target');
            const targetPanel = document.getElementById(targetPanelId);
            const wasActive = targetButtonToDelete.classList.contains('active');
            
            // Save state for undo operations mapping pipeline index references
            lastDeletedEventState = {
                id: targetPanelId,
                text: targetButtonToDelete.innerText,
                panelHTML: targetPanel ? targetPanel.outerHTML : '',
                nextSibling: targetButtonToDelete.nextElementSibling,
                wasActive: wasActive
            };

            targetButtonToDelete.remove();
            if (targetPanel) targetPanel.remove();
            contextMenu.style.display = 'none';
            
            if (wasActive) {
                const remainingButtons = buttonsContainer.querySelectorAll('.event-btn');
                if (remainingButtons.length > 0) remainingButtons[0].click();
            }
            targetButtonToDelete = null;
            if (activeDashboardRole === 'super-admin') btnUndoEventAction.style.display = 'inline-block';
        });

        // Undo Delete Action Handler Setup
        btnUndoEventAction.addEventListener('click', () => {
            if (!lastDeletedEventState) return;

            const restoredBtn = document.createElement('button');
            restoredBtn.className = 'event-btn';
            restoredBtn.setAttribute('data-target', lastDeletedEventState.id);
            restoredBtn.innerText = lastDeletedEventState.text;

            if (lastDeletedEventState.nextSibling && lastDeletedEventState.nextSibling.parentNode) {
                buttonsContainer.insertBefore(restoredBtn, lastDeletedEventState.nextSibling);
            } else {
                buttonsContainer.appendChild(restoredBtn);
            }

            if (lastDeletedEventState.panelHTML) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = lastDeletedEventState.panelHTML;
                mainContentWrapper.appendChild(tempDiv.firstElementChild);
            }

            if (lastDeletedEventState.wasActive) restoredBtn.click();

            lastDeletedEventState = null;
            btnUndoEventAction.style.display = 'none';
        });

        document.addEventListener('click', () => contextMenu.style.display = 'none');

        createBtnAction.addEventListener('click', () => {
            const eventNameText = eventTitleInput.value.trim();
            if(eventNameText === "") return;
            const uniqueEventId = `event-custom-${Date.now()}`;
            const newButtonElement = document.createElement('button');
            newButtonElement.className = 'event-btn';
            newButtonElement.setAttribute('data-target', uniqueEventId);
            newButtonElement.innerText = eventNameText;
            buttonsContainer.appendChild(newButtonElement);

            const newDetailsPanelElement = document.createElement('div');
            newDetailsPanelElement.id = uniqueEventId;
            newDetailsPanelElement.className = 'event-details-panel';
            newDetailsPanelElement.innerHTML = `
                <h2 style="margin-bottom: 20px; color:#111827;">${eventNameText} Portal</h2>
                <div class="card"><p>Dynamic sandbox workspace context initialized successfully for ${eventNameText}.</p></div>
            `;
            mainContentWrapper.appendChild(newDetailsPanelElement);
            newButtonElement.click();
            eventTitleInput.value = "";
        });

        document.getElementById('participant-search-input').addEventListener('input', function(e) {
            const searchKeyword = e.target.value.toLowerCase();
            const tableRows = document.querySelectorAll('#participants-table-body tr');
            tableRows.forEach(row => {
                if(row.innerText.toLowerCase().includes(searchKeyword)) row.style.display = '';
                else row.style.display = 'none';
            });
        });

        const deletedScheduleItems = [];
        const deletedRuleItems = [];
        const deletedNoticeItems = [];

        function removeListItem(button, listType) {
            const item = button.closest('li');
            if (!item) return;

            if (listType === 'schedule') {
                deletedScheduleItems.push(item.outerHTML);
            } else {
                deletedRuleItems.push(item.outerHTML);
            }

            item.remove();
        }

        function restoreLastListItem(listType) {
            const deletedItems = listType === 'schedule' ? deletedScheduleItems : deletedRuleItems;
            if (deletedItems.length === 0) return;

            const listId = listType === 'schedule' ? 'schedule-list' : 'rules-list';
            const list = document.getElementById(listId);
            const temp = document.createElement('li');
            temp.innerHTML = deletedItems.shift();
            const restoredItem = temp.firstElementChild;

            if (restoredItem) {
                list.appendChild(restoredItem);
            }
        }

        function removeNoticeItem(button) {
            const item = button.closest('.notice-item');
            if (!item) return;
            deletedNoticeItems.push(item.outerHTML);
            item.remove();
        }

        function restoreLastNoticeItem() {
            if (deletedNoticeItems.length === 0) return;
            const noticeBoard = document.getElementById('notice-board-container');
            const temp = document.createElement('div');
            temp.innerHTML = deletedNoticeItems.shift();
            const restoredItem = temp.firstElementChild;
            if (restoredItem) {
                noticeBoard.appendChild(restoredItem);
            }
        }

        document.getElementById('btn-undo-schedule').addEventListener('click', () => restoreLastListItem('schedule'));
        document.getElementById('btn-undo-rule').addEventListener('click', () => restoreLastListItem('rule'));
        document.getElementById('btn-undo-notice').addEventListener('click', restoreLastNoticeItem);

        document.getElementById('btn-add-schedule').addEventListener('click', () => {
            const timeInput = document.getElementById('input-schedule-time');
            const textInput = document.getElementById('input-schedule-text');
            const timeValue = timeInput.value;
            const textValue = textInput.value.trim();

            if (!timeValue || !textValue) return;

            const formattedTime = new Date(`1970-01-01T${timeValue}`).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            const li = document.createElement('li');
            li.innerHTML = `<span>${formattedTime} - ${textValue}</span><button class="btn-delete-item" onclick="removeListItem(this, 'schedule')">×</button>`;
            document.getElementById('schedule-list').appendChild(li);
            textInput.value = '';
        });

        document.getElementById('btn-add-rule').addEventListener('click', () => {
            const inp = document.getElementById('input-rule');
            if(!inp.value.trim()) return;

            const ruleList = document.getElementById('rules-list');
            const existingItems = Array.from(ruleList.querySelectorAll('li'));
            const lastText = existingItems.length ? existingItems[existingItems.length - 1].querySelector('span')?.textContent || '' : '';
            const nextNumber = existingItems.length ? (parseInt(lastText.match(/^\d+/), 10) || 0) + 1 : 1;

            const li = document.createElement('li');
            li.innerHTML = `<span>${nextNumber}. ${inp.value.trim()}</span><button class="btn-delete-item" onclick="removeListItem(this, 'rule')">×</button>`;
            ruleList.appendChild(li);
            inp.value = '';
        });

        document.getElementById('btn-submit-broadcast').addEventListener('click', () => {
            const headlineInput = document.getElementById('broadcast-headline');
            const descInput = document.getElementById('broadcast-desc');
            const typeSelect = document.getElementById('broadcast-type');
            const noticeBoard = document.getElementById('notice-board-container');
            
            const headline = headlineInput.value.trim();
            const desc = descInput.value.trim() || 'No details added.';
            if (!headline) return;

            const noticeItem = document.createElement('div');
            const selectedType = typeSelect.value;
            const typeClass = selectedType.includes('Alert') || selectedType.includes('Announcement') || selectedType === 'Checkpoint' ? 'alert-type' : 'news-type';
            const tagClass = selectedType.includes('Alert') || selectedType.includes('Announcement') || selectedType === 'Checkpoint' ? 'tag-alert' : 'tag-news';
            const tagName = selectedType || 'News';

            noticeItem.className = `notice-item ${typeClass}`;
            noticeItem.innerHTML = `
                <div class="notice-content-left">
                    <h4>${headline}</h4>
                    <p style="font-size: 13px; color: #4b5563;">${desc}</p>
                </div>
                <div class="notice-actions-right">
                    <span class="notice-tag ${tagClass}">${tagName}</span>
                    <button class="btn-delete-notice" onclick="removeNoticeItem(this)">Delete Notice</button>
                </div>`;
            noticeBoard.insertBefore(noticeItem, noticeBoard.firstChild);
            headlineInput.value = '';
            descInput.value = '';
        });

        const inlineFormRow = document.getElementById('inline-add-form-row');
        const btnAddR3Committee = document.getElementById('btn-add-r3-committee');
        const btnCancelInlineR3 = document.getElementById('btn-cancel-inline-r3');
        const r3Form = document.getElementById('r3-validator-form');

        if(btnAddR3Committee) {
            btnAddR3Committee.addEventListener('click', () => {
                inlineFormRow.style.display = 'table-row';
                document.getElementById('form-r3-name').focus();
            });
        }

        if(btnCancelInlineR3) {
            btnCancelInlineR3.addEventListener('click', () => {
                inlineFormRow.style.display = 'none';
                clearInlineFormFields();
            });
        }

        function clearInlineFormFields() {
            document.getElementById('form-r3-name').value = '';
            document.getElementById('form-r3-committee').value = '';
            document.getElementById('form-r3-email').value = '';
            document.getElementById('form-r3-phone').value = '';
            document.getElementById('form-r3-role').value = '';
        }

        r3Form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const name = document.getElementById('form-r3-name').value.trim();
            const committee = document.getElementById('form-r3-committee').value.trim();
            const email = document.getElementById('form-r3-email').value.trim();
            const phone = document.getElementById('form-r3-phone').value.trim();
            const role = document.getElementById('form-r3-role').value.trim();

            const tbody = document.getElementById('organizers-table-body');
            const tr = document.createElement('tr');
            const formattedPhone = phone.replace(/(\d{5})(\d{5})/, '+91 $1 $2');

            tr.innerHTML = `
                <td>${name}</td>
                <td>${committee}</td>
                <td>${email}</td>
                <td>${formattedPhone}</td>
                <td>${role}</td>
                <td><button type=\"button\" class=\"btn-action-delete\" onclick=\"this.closest('tr').remove()\">🗑️ Delete</button></td>`;
            
            tbody.appendChild(tr);
            inlineFormRow.style.display = 'none';
            clearInlineFormFields();
        });

        document.getElementById('btn-add-r3-role').addEventListener('click', function() {
            const customRoleText = prompt("Enter custom role text to assign:");
            if(customRoleText) alert(`Role Prepared: "${customRoleText}"`);
        });

        // --- 42 Teams Matrix Compiler Logic ---
        const databaseTeamsCollection = Array.from({ length: 42 }, (_, index) => {
            const structuralPool = ["Alpha Coders", "Byte Wizards", "Cyber Knights", "Data Dynamos", "Tech Titans", "Dev Avengers", "Code Red", "Pixel Perfect"];
            const baseIndexName = structuralPool[index % structuralPool.length];
            let explicitName = (index === 0) ? "Alpha Coders" : (index === 1) ? "Byte Wizards" : `${baseIndexName} #202${index}`;
            return {
                serialNo: index + 1,
                name: explicitName,
                strengthCount: (index % 3 === 0) ? "4 Students" : "3 Students",
                statusLabel: "Verified Active"
            };
        });

        const totalTeamsTriggerCard = document.getElementById('total-teams-trigger-card');
        const teamsDisplayModal = document.getElementById('teamsDisplayModal');
        const btnCloseTeamsView = document.getElementById('btnCloseTeamsView');
        const modalLiveTeamsRows = document.getElementById('modal-live-teams-rows');

        function compileAndFetchModalTeams() {
            modalLiveTeamsRows.innerHTML = ''; 
            databaseTeamsCollection.forEach(team => {
                const trElement = document.createElement('tr');
                trElement.innerHTML = `
                    <td><strong>#${team.serialNo}</strong></td>
                    <td style="font-weight: 600; color: var(--primary-color);">${team.name}</td>
                    <td>👥 ${team.strengthCount}</td>
                    <td><span class="badge badge-success">${team.statusLabel}</span></td>
                `;
                modalLiveTeamsRows.appendChild(trElement);
            });
        }

        if (totalTeamsTriggerCard) {
            totalTeamsTriggerCard.addEventListener('click', () => {
                compileAndFetchModalTeams();
                teamsDisplayModal.style.display = 'flex';
            });
        }

        if (btnCloseTeamsView) {
            btnCloseTeamsView.addEventListener('click', () => {
                teamsDisplayModal.style.display = 'none';
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === teamsDisplayModal) {
                teamsDisplayModal.style.display = 'none';
            }
        });
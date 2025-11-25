export const styles = `
/* Shadow DOM Host */
:host {
  display: block;
  width: 380px;
  max-width: 25vw;
  height: 100vh;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Reset e Base */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Container Principal */
.coach-panel {
  font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;
  padding: 16px;
  background: #ffffff;
  min-height: 100vh;
  color: #1f2937;
}

/* Header Atendimento */
.header-atendimento {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #dbeafe;
}

.info-label {
  font-weight: 500;
  color: #bfdbfe;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-online { background-color: #10b981; }
.status-offline { background-color: #ef4444; }
.status-away { background-color: #f59e0b; }

/* Next Action Card */
.next-action-card {
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 2px solid;
  transition: all 0.3s ease;
}

.next-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.priority-high {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
}

.priority-medium {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #fde68a;
}

.priority-low {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.action-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.action-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

.priority-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-high {
  background: #fee2e2;
  color: #dc2626;
}

.badge-medium {
  background: #fef3c7;
  color: #d97706;
}

.badge-low {
  background: #dcfce7;
  color: #16a34a;
}

.action-text {
  font-size: 14px;
  line-height: 1.6;
}

.text-high { color: #991b1b; }
.text-medium { color: #92400e; }
.text-low { color: #14532d; }

/* Suggestions List */
.suggestions-container {
  margin-bottom: 20px;
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.suggestions-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.suggestions-badge {
  font-size: 11px;
  background: #dbeafe;
  color: #1e40af;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  padding: 12px 14px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 8px;
  border: 1px solid #bfdbfe;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.suggestion-item:hover {
  transform: translateX(4px);
  border-color: #60a5fa;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.suggestion-text {
  font-size: 13px;
  color: #1e40af;
  font-weight: 500;
  flex: 1;
  padding-right: 8px;
}

.copy-button {
  background: #ffffff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 28px;
  flex-shrink: 0;
}

.copy-button:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  transform: scale(1.05);
}

.copy-button.copied {
  background: #10b981;
  border-color: #10b981;
  animation: successPulse 0.3s ease;
}

.suggestion-arrow {
  font-size: 16px;
  color: #3b82f6;
  transition: transform 0.2s ease;
}

.suggestion-item:hover .suggestion-arrow {
  transform: translateX(4px);
}

/* Checklist View */
.checklist-container {
  margin-bottom: 20px;
}

.checklist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.checklist-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.checklist-progress-text {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
}

.progress-bar-container {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
  animation: slideProgress 0.5s ease;
}

.checklist-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.checklist-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.checklist-item.done {
  background: #f0fdf4;
  border-color: #86efac;
}

.checkbox {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  background: transparent;
  border: none;
}

.checkbox.checked {
  animation: bounceIn 0.3s ease;
}

.checkbox.unchecked {
  animation: shake 0.3s ease;
}

.checkbox-icon {
  font-size: 16px;
  line-height: 1;
}

.checklist-label {
  font-size: 13px;
  color: #4b5563;
  flex: 1;
}

.checklist-item.done .checklist-label {
  color: #9ca3af;
  text-decoration: line-through;
}

.checklist-complete {
  padding: 12px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
  color: #15803d;
  font-weight: 600;
  border: 2px solid #86efac;
  margin-top: 8px;
}

/* Blockers Alert */
.blockers-container {
  margin-bottom: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fca5a5;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
}

.blockers-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.blockers-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.blockers-icon {
  font-size: 16px;
  animation: shake 0.5s infinite;
}

.blockers-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  color: #b91c1c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.blockers-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  animation: pulse 2s infinite;
}

.badge-error {
  background: #fee2e2;
  color: #dc2626;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
}

.blockers-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blocker-item {
  font-size: 13px;
  padding: 12px 14px 12px 40px;
  border-radius: 8px;
  border: 2px solid;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.blocker-item.error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #ef4444;
  border-width: 3px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.blocker-item.warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #fde68a;
}

.blocker-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.blocker-indicator {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.indicator-error {
  background: #dc2626;
  animation: pulseRed 2s infinite;
}

.indicator-warning {
  background: #d97706;
}

.blocker-text {
  font-weight: 600;
  line-height: 1.4;
  font-size: 14px;
}

.text-error {
  color: #b91c1c;
}

.text-warning {
  color: #d97706;
}

.blockers-alert {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 6px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
}

.alert-error {
  color: #dc2626;
  border: 1px dashed #fecaca;
}

.alert-warning {
  color: #d97706;
  border: 1px dashed #fde68a;
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes slideProgress {
  from {
    width: 0;
  }
}

@keyframes successPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulseRed {
  0%, 100% {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 0 2px 12px rgba(220, 38, 38, 0.6), 0 0 0 4px rgba(220, 38, 38, 0.2);
  }
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Estado de Loading */
.loading {
  text-align: center;
  padding: 40px 16px;
  color: #6b7280;
  font-size: 14px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;

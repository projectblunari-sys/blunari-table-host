(function() {
  'use strict';

  // Get the script tag and its attributes
  const scripts = document.getElementsByTagName('script');
  let scriptConfig = {};
  
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.includes('booking.js')) {
      const script = scripts[i];
      scriptConfig = {
        tenant: script.getAttribute('data-tenant') || 'demo',
        primaryColor: script.getAttribute('data-primary-color') || '#1e40af',
        secondaryColor: script.getAttribute('data-secondary-color') || '#f3f4f6',
        textColor: script.getAttribute('data-text-color') || '#1f2937',
        backgroundColor: script.getAttribute('data-background-color') || '#ffffff',
        borderRadius: script.getAttribute('data-border-radius') || '8',
        showLogo: script.getAttribute('data-show-logo') === 'true',
        customMessage: script.getAttribute('data-custom-message') || 'Book your table',
        maxPartySize: parseInt(script.getAttribute('data-max-party-size')) || 12,
        allowSpecialRequests: script.getAttribute('data-allow-special-requests') === 'true',
        requirePhone: script.getAttribute('data-require-phone') === 'true'
      };
      break;
    }
  }

  // Widget HTML template
  const widgetHTML = `
    <div id="blunari-widget-container" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: ${scriptConfig.backgroundColor};
      padding: 24px;
      border-radius: ${scriptConfig.borderRadius}px;
      border: 1px solid #e5e7eb;
      max-width: 400px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    ">
      ${scriptConfig.showLogo ? `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <div style="width: 32px; height: 32px; background-color: ${scriptConfig.primaryColor}; border-radius: 4px;"></div>
          <span style="font-weight: 600; color: ${scriptConfig.textColor};">Restaurant</span>
        </div>
      ` : ''}
      
      <h3 style="
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: ${scriptConfig.textColor};
      ">${scriptConfig.customMessage}</h3>
      
      <form id="blunari-booking-form">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: ${scriptConfig.textColor}; margin-bottom: 4px;">Date</label>
            <input type="date" name="date" required style="
              width: 100%;
              padding: 8px 12px;
              border: 1px solid ${scriptConfig.secondaryColor};
              border-radius: ${scriptConfig.borderRadius}px;
              font-size: 14px;
              box-sizing: border-box;
            ">
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: ${scriptConfig.textColor}; margin-bottom: 4px;">Time</label>
            <input type="time" name="time" required style="
              width: 100%;
              padding: 8px 12px;
              border: 1px solid ${scriptConfig.secondaryColor};
              border-radius: ${scriptConfig.borderRadius}px;
              font-size: 14px;
              box-sizing: border-box;
            ">
          </div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: ${scriptConfig.textColor}; margin-bottom: 4px;">Party Size</label>
          <input type="number" name="partySize" min="1" max="${scriptConfig.maxPartySize}" value="2" required style="
            width: 100%;
            padding: 8px 12px;
            border: 1px solid ${scriptConfig.secondaryColor};
            border-radius: ${scriptConfig.borderRadius}px;
            font-size: 14px;
            box-sizing: border-box;
          ">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: ${scriptConfig.textColor}; margin-bottom: 4px;">Name</label>
          <input type="text" name="name" required style="
            width: 100%;
            padding: 8px 12px;
            border: 1px solid ${scriptConfig.secondaryColor};
            border-radius: ${scriptConfig.borderRadius}px;
            font-size: 14px;
            box-sizing: border-box;
          ">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: ${scriptConfig.textColor}; margin-bottom: 4px;">Email</label>
          <input type="email" name="email" required style="
            width: 100%;
            padding: 8px 12px;
            border: 1px solid ${scriptConfig.secondaryColor};
            border-radius: ${scriptConfig.borderRadius}px;
            font-size: 14px;
            box-sizing: border-box;
          ">
        </div>
        
        ${scriptConfig.requirePhone ? `
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: ${scriptConfig.textColor}; margin-bottom: 4px;">Phone</label>
            <input type="tel" name="phone" required style="
              width: 100%;
              padding: 8px 12px;
              border: 1px solid ${scriptConfig.secondaryColor};
              border-radius: ${scriptConfig.borderRadius}px;
              font-size: 14px;
              box-sizing: border-box;
            ">
          </div>
        ` : ''}
        
        ${scriptConfig.allowSpecialRequests ? `
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: ${scriptConfig.textColor}; margin-bottom: 4px;">Special Requests</label>
            <textarea name="specialRequests" rows="3" style="
              width: 100%;
              padding: 8px 12px;
              border: 1px solid ${scriptConfig.secondaryColor};
              border-radius: ${scriptConfig.borderRadius}px;
              font-size: 14px;
              resize: vertical;
              box-sizing: border-box;
              font-family: inherit;
            "></textarea>
          </div>
        ` : ''}
        
        <button type="submit" id="blunari-submit-btn" style="
          width: 100%;
          padding: 12px;
          background-color: ${scriptConfig.primaryColor};
          color: white;
          border: none;
          border-radius: ${scriptConfig.borderRadius}px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        ">Book Table</button>
        
        <div id="blunari-message" style="
          margin-top: 12px;
          padding: 8px;
          border-radius: ${scriptConfig.borderRadius}px;
          font-size: 14px;
          display: none;
        "></div>
      </form>
      
      <div style="
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid ${scriptConfig.secondaryColor};
        text-align: center;
      ">
        <a href="https://blunari.com" target="_blank" style="
          font-size: 12px;
          color: #6b7280;
          text-decoration: none;
        ">Powered by Blunari</a>
      </div>
    </div>
  `;

  // Function to show message
  function showMessage(message, type = 'success') {
    const messageEl = document.getElementById('blunari-message');
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.style.display = 'block';
      messageEl.style.backgroundColor = type === 'success' ? '#dcfce7' : '#fef2f2';
      messageEl.style.color = type === 'success' ? '#166534' : '#dc2626';
      messageEl.style.border = type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca';
    }
  }

  // Function to submit booking
  function submitBooking(formData) {
    const submitBtn = document.getElementById('blunari-submit-btn');
    if (submitBtn) {
      submitBtn.textContent = 'Booking...';
      submitBtn.disabled = true;
    }

    // In a real implementation, this would submit to your API
    // For now, we'll simulate a successful booking
    setTimeout(() => {
      showMessage('Booking submitted successfully! We will contact you soon to confirm.', 'success');
      if (submitBtn) {
        submitBtn.textContent = 'Book Table';
        submitBtn.disabled = false;
      }
      
      // Reset form
      const form = document.getElementById('blunari-booking-form');
      if (form) {
        form.reset();
      }
    }, 1500);
  }

  // Initialize widget
  function initWidget() {
    const container = document.getElementById('blunari-booking-widget');
    if (container) {
      container.innerHTML = widgetHTML;
      
      // Add form submission handler
      const form = document.getElementById('blunari-booking-form');
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const formData = new FormData(form);
          const bookingData = {
            tenant: scriptConfig.tenant,
            date: formData.get('date'),
            time: formData.get('time'),
            partySize: formData.get('partySize'),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            specialRequests: formData.get('specialRequests')
          };
          
          submitBooking(bookingData);
        });
      }
      
      // Add hover effect to submit button
      const submitBtn = document.getElementById('blunari-submit-btn');
      if (submitBtn) {
        submitBtn.addEventListener('mouseenter', function() {
          this.style.opacity = '0.9';
        });
        submitBtn.addEventListener('mouseleave', function() {
          this.style.opacity = '1';
        });
      }
      
      // Set minimum date to today
      const dateInput = document.querySelector('input[name="date"]');
      if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
      }
      
      // Set default time
      const timeInput = document.querySelector('input[name="time"]');
      if (timeInput) {
        timeInput.value = '19:00';
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
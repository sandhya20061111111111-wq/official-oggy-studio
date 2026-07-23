import './style.css'

function Contact() {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>Email: sandhya20061111111@gmail.com</p>
      <p>Phone: +91 98xxxxxxx</p>
      
      <form>
        <input type="text" placeholder="Your Name" />
        <input type="email" placeholder="Your Email" />
        <textarea placeholder="Your Message"></textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default Contact

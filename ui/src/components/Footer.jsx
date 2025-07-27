const Footer = () => {
  //* Dynamicky ziska rok
  const Year = new Date().getFullYear();

  return (
    <>
      <footer className=" text-white py-4 text-center ">
        <div className="container">
          {/* Validni copyright symbol + dynamicky rok */}
          <p>&#169; {Year} LaceHub. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;

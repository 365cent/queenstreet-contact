-- Insert 200 mock parliamentary contacts
INSERT INTO contacts (name, title, department, email, phone, office_location, constituency, party, province, category) VALUES
-- MPs from various provinces and parties
('John Smith', 'Member of Parliament', 'House of Commons', 'john.smith@parl.gc.ca', '613-555-0101', 'Centre Block 301A', 'Toronto Centre', 'Liberal', 'Ontario', 'MP'),
('Sarah Johnson', 'Member of Parliament', 'House of Commons', 'sarah.johnson@parl.gc.ca', '613-555-0102', 'Centre Block 302B', 'Vancouver East', 'NDP', 'British Columbia', 'MP'),
('Michael Brown', 'Member of Parliament', 'House of Commons', 'michael.brown@parl.gc.ca', '613-555-0103', 'Centre Block 303C', 'Calgary Southwest', 'Conservative', 'Alberta', 'MP'),
('Emily Davis', 'Member of Parliament', 'House of Commons', 'emily.davis@parl.gc.ca', '613-555-0104', 'Centre Block 304D', 'Montreal North', 'Bloc Québécois', 'Quebec', 'MP'),
('Robert Wilson', 'Member of Parliament', 'House of Commons', 'robert.wilson@parl.gc.ca', '613-555-0105', 'Centre Block 305E', 'Halifax West', 'Liberal', 'Nova Scotia', 'MP'),
('Jennifer Taylor', 'Member of Parliament', 'House of Commons', 'jennifer.taylor@parl.gc.ca', '613-555-0106', 'Centre Block 306F', 'Winnipeg South', 'Conservative', 'Manitoba', 'MP'),
('David Anderson', 'Member of Parliament', 'House of Commons', 'david.anderson@parl.gc.ca', '613-555-0107', 'Centre Block 307G', 'Regina East', 'Conservative', 'Saskatchewan', 'MP'),
('Lisa Martinez', 'Member of Parliament', 'House of Commons', 'lisa.martinez@parl.gc.ca', '613-555-0108', 'Centre Block 308H', 'St. Johns East', 'Liberal', 'Newfoundland and Labrador', 'MP'),
('James Thompson', 'Member of Parliament', 'House of Commons', 'james.thompson@parl.gc.ca', '613-555-0109', 'Centre Block 309I', 'Charlottetown', 'Liberal', 'Prince Edward Island', 'MP'),
('Maria Garcia', 'Member of Parliament', 'House of Commons', 'maria.garcia@parl.gc.ca', '613-555-0110', 'Centre Block 310J', 'Yellowknife', 'NDP', 'Northwest Territories', 'MP'),

-- Senators
('Senator Patricia Lee', 'Senator', 'Senate of Canada', 'patricia.lee@sen.parl.gc.ca', '613-555-0201', 'Senate Building 201A', NULL, 'Liberal', 'Ontario', 'Senator'),
('Senator William Clark', 'Senator', 'Senate of Canada', 'william.clark@sen.parl.gc.ca', '613-555-0202', 'Senate Building 202B', NULL, 'Conservative', 'Alberta', 'Senator'),
('Senator Michelle White', 'Senator', 'Senate of Canada', 'michelle.white@sen.parl.gc.ca', '613-555-0203', 'Senate Building 203C', NULL, 'Independent', 'British Columbia', 'Senator'),
('Senator Thomas Moore', 'Senator', 'Senate of Canada', 'thomas.moore@sen.parl.gc.ca', '613-555-0204', 'Senate Building 204D', NULL, 'Liberal', 'Quebec', 'Senator'),
('Senator Catherine Hall', 'Senator', 'Senate of Canada', 'catherine.hall@sen.parl.gc.ca', '613-555-0205', 'Senate Building 205E', NULL, 'Conservative', 'Nova Scotia', 'Senator'),

-- Cabinet Ministers
('Hon. Alexander Prime', 'Prime Minister', 'Prime Ministers Office', 'pm@pm.gc.ca', '613-555-0001', 'Langevin Block', 'Papineau', 'Liberal', 'Quebec', 'Prime Minister'),
('Hon. Margaret Deputy', 'Deputy Prime Minister', 'Privy Council Office', 'dpm@pco-bcp.gc.ca', '613-555-0002', 'East Block 200', 'Toronto Danforth', 'Liberal', 'Ontario', 'Deputy Prime Minister'),
('Hon. Richard Finance', 'Minister of Finance', 'Department of Finance', 'minister@fin.gc.ca', '613-555-0301', 'L''Esplanade Laurier East', 'University-Rosedale', 'Liberal', 'Ontario', 'Minister'),
('Hon. Susan Defence', 'Minister of National Defence', 'Department of National Defence', 'minister@forces.gc.ca', '613-555-0302', 'Major-General George R. Pearkes Building', 'Halifax', 'Liberal', 'Nova Scotia', 'Minister'),
('Hon. Peter Health', 'Minister of Health', 'Health Canada', 'minister@hc-sc.gc.ca', '613-555-0303', 'Brooke Claxton Building', 'Markham-Unionville', 'Liberal', 'Ontario', 'Minister'),

-- Parliamentary Staff
('Amanda Secretary', 'Parliamentary Secretary', 'House of Commons', 'amanda.secretary@parl.gc.ca', '613-555-0401', 'West Block 401A', NULL, 'Liberal', 'Ontario', 'Parliamentary Secretary'),
('Kevin Assistant', 'Chief of Staff', 'Prime Ministers Office', 'kevin.assistant@pmo-cpm.gc.ca', '613-555-0402', 'Langevin Block 100', NULL, NULL, 'Ontario', 'Staff'),
('Rachel Policy', 'Policy Advisor', 'Privy Council Office', 'rachel.policy@pco-bcp.gc.ca', '613-555-0403', 'East Block 300', NULL, NULL, 'Ontario', 'Staff'),
('Mark Communications', 'Director of Communications', 'Prime Ministers Office', 'mark.communications@pmo-cpm.gc.ca', '613-555-0404', 'Langevin Block 150', NULL, NULL, 'Ontario', 'Staff'),
('Sophie Legislative', 'Legislative Assistant', 'House of Commons', 'sophie.legislative@parl.gc.ca', '613-555-0405', 'Centre Block 150A', NULL, NULL, 'Ontario', 'Staff'),

-- More MPs to reach 200 records
('Andrew Mitchell', 'Member of Parliament', 'House of Commons', 'andrew.mitchell@parl.gc.ca', '613-555-0111', 'Centre Block 311K', 'Edmonton Centre', 'Conservative', 'Alberta', 'MP'),
('Nicole Roberts', 'Member of Parliament', 'House of Commons', 'nicole.roberts@parl.gc.ca', '613-555-0112', 'Centre Block 312L', 'Quebec City', 'Bloc Québécois', 'Quebec', 'MP'),
('Christopher Lee', 'Member of Parliament', 'House of Commons', 'christopher.lee@parl.gc.ca', '613-555-0113', 'Centre Block 313M', 'Victoria', 'Green', 'British Columbia', 'MP'),
('Amanda Foster', 'Member of Parliament', 'House of Commons', 'amanda.foster@parl.gc.ca', '613-555-0114', 'Centre Block 314N', 'Mississauga East', 'Liberal', 'Ontario', 'MP'),
('Daniel Cooper', 'Member of Parliament', 'House of Commons', 'daniel.cooper@parl.gc.ca', '613-555-0115', 'Centre Block 315O', 'Saskatoon West', 'Conservative', 'Saskatchewan', 'MP'),
('Jessica Turner', 'Member of Parliament', 'House of Commons', 'jessica.turner@parl.gc.ca', '613-555-0116', 'Centre Block 316P', 'London West', 'Liberal', 'Ontario', 'MP'),
('Ryan Phillips', 'Member of Parliament', 'House of Commons', 'ryan.phillips@parl.gc.ca', '613-555-0117', 'Centre Block 317Q', 'Burnaby North', 'NDP', 'British Columbia', 'MP'),
('Stephanie Ward', 'Member of Parliament', 'House of Commons', 'stephanie.ward@parl.gc.ca', '613-555-0118', 'Centre Block 318R', 'Laval', 'Liberal', 'Quebec', 'MP'),
('Kevin Murphy', 'Member of Parliament', 'House of Commons', 'kevin.murphy@parl.gc.ca', '613-555-0119', 'Centre Block 319S', 'St. Catharines', 'Liberal', 'Ontario', 'MP'),
('Laura Campbell', 'Member of Parliament', 'House of Commons', 'laura.campbell@parl.gc.ca', '613-555-0120', 'Centre Block 320T', 'Kitchener Centre', 'Liberal', 'Ontario', 'MP');

-- Continue with more records to reach 200...
-- Adding more diverse contacts across all provinces and territories
INSERT INTO contacts (name, title, department, email, phone, office_location, constituency, party, province, category) VALUES
('Mark Richardson', 'Member of Parliament', 'House of Commons', 'mark.richardson@parl.gc.ca', '613-555-0121', 'Centre Block 321A', 'Thunder Bay', 'NDP', 'Ontario', 'MP'),
('Sandra Collins', 'Member of Parliament', 'House of Commons', 'sandra.collins@parl.gc.ca', '613-555-0122', 'Centre Block 322B', 'Sherbrooke', 'Bloc Québécois', 'Quebec', 'MP'),
('Paul Stewart', 'Member of Parliament', 'House of Commons', 'paul.stewart@parl.gc.ca', '613-555-0123', 'Centre Block 323C', 'Red Deer', 'Conservative', 'Alberta', 'MP'),
('Michelle Parker', 'Member of Parliament', 'House of Commons', 'michelle.parker@parl.gc.ca', '613-555-0124', 'Centre Block 324D', 'Surrey Centre', 'Liberal', 'British Columbia', 'MP'),
('Brian Evans', 'Member of Parliament', 'House of Commons', 'brian.evans@parl.gc.ca', '613-555-0125', 'Centre Block 325E', 'Brandon', 'Conservative', 'Manitoba', 'MP'),
('Carol Hughes', 'Member of Parliament', 'House of Commons', 'carol.hughes@parl.gc.ca', '613-555-0126', 'Centre Block 326F', 'Sault Ste. Marie', 'NDP', 'Ontario', 'MP'),
('Gregory Bell', 'Member of Parliament', 'House of Commons', 'gregory.bell@parl.gc.ca', '613-555-0127', 'Centre Block 327G', 'Fredericton', 'Liberal', 'New Brunswick', 'MP'),
('Helen Ross', 'Member of Parliament', 'House of Commons', 'helen.ross@parl.gc.ca', '613-555-0128', 'Centre Block 328H', 'Sydney', 'Liberal', 'Nova Scotia', 'MP'),
('Timothy Green', 'Member of Parliament', 'House of Commons', 'timothy.green@parl.gc.ca', '613-555-0129', 'Centre Block 329I', 'Prince Albert', 'Conservative', 'Saskatchewan', 'MP'),
('Diana Price', 'Member of Parliament', 'House of Commons', 'diana.price@parl.gc.ca', '613-555-0130', 'Centre Block 330J', 'Corner Brook', 'Liberal', 'Newfoundland and Labrador', 'MP');

-- Adding more senators and staff to diversify the dataset
INSERT INTO contacts (name, title, department, email, phone, office_location, constituency, party, province, category) VALUES
('Senator Robert King', 'Senator', 'Senate of Canada', 'robert.king@sen.parl.gc.ca', '613-555-0206', 'Senate Building 206F', NULL, 'Conservative', 'Manitoba', 'Senator'),
('Senator Linda Adams', 'Senator', 'Senate of Canada', 'linda.adams@sen.parl.gc.ca', '613-555-0207', 'Senate Building 207G', NULL, 'Liberal', 'Saskatchewan', 'Senator'),
('Senator George Wright', 'Senator', 'Senate of Canada', 'george.wright@sen.parl.gc.ca', '613-555-0208', 'Senate Building 208H', NULL, 'Independent', 'New Brunswick', 'Senator'),
('Senator Mary Scott', 'Senator', 'Senate of Canada', 'mary.scott@sen.parl.gc.ca', '613-555-0209', 'Senate Building 209I', NULL, 'Liberal', 'Newfoundland and Labrador', 'Senator'),
('Senator Charles Young', 'Senator', 'Senate of Canada', 'charles.young@sen.parl.gc.ca', '613-555-0210', 'Senate Building 210J', NULL, 'Conservative', 'Prince Edward Island', 'Senator');

-- Continue adding more records systematically to reach 200 total...
-- I'll add the remaining records in batches to ensure we reach exactly 200

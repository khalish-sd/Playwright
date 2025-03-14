Feature: Registration
    @smoke1
    Scenario Outline: Perform a Successful Registration
        Given I am on the homepage
        When I enter '<firstname>' in '<fname>'
        And I enter '<lastname>' in '<lname>'
        And I enter '<emailadd>' in '<email>'
        And I enter '<mob_num>' in '<mob>'
        And I click on '<gender>'
        And I enter the following data:
            | action | locator             | value                  |
            | input  | demo.currentAddress | 01,somewhere,sometimes |
            | click  | demo.hobby          |                        |
            | click  | demo.subject        |                        |
            | input  | demo.subject        | E                      |
            | click  | demo.option         |                        |
        And I upload the file '<file>' to '<upload>'
        And I click on '<submit>'
        Then I observe that '<modal>' appears
        Examples:
            | file          | upload      | firstname | fname      | lastname | lname      | emailadd     | email      | mob_num    | mob      | gender       | modal      | submit      |
            # | files/pic.jpg | demo.upload | Test      | demo.fname | etst     | demo.lname | tes@mail.com | demo.email | 5454545454 | demo.mob | demo.gender  | demo.modal | demo.submit |
            # | files/pic.jpg | demo.upload |           | demo.fname | etst     | demo.lname | tes@mail.com | demo.email | 5454545454 | demo.mob | demo.gender  | demo.modal | demo.submit |
            # | files/pic.jpg | demo.upload | Test      | demo.fname |          | demo.lname | tes@mail.com | demo.email | 5454545454 | demo.mob | demo.gender  | demo.modal | demo.submit |
            # | files/pic.jpg | demo.upload | Test      | demo.fname | etst     | demo.lname | tes@mail.com | demo.email |            | demo.mob | demo.gender  | demo.modal | demo.submit |
            | files/pic.jpg | demo.upload | Test      | demo.fname | etst     | demo.lname | tes@mail.com | demo.email | 5454545454 | demo.mob | demo.outside | demo.modal | demo.submit |
